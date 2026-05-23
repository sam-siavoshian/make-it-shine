// Multi-source tech firehose. Each fn returns Post[].
// No deps, fetch only. Fail-soft per source.

import { topStories, showStories, askStories, jobStories, items as hnItems } from "./hn";

export interface Post {
  source: string;
  id: string;
  title: string;
  url: string;
  permalink: string;
  author?: string;
  score?: number;
  comments?: number;
  createdAt: number; // unix seconds
  text?: string;
  tags?: string[];
}

const UA = "firehose/0.1 (multi-source tech aggregator)";

async function safeJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      console.error(`[fetch ${res.status}] ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[fetch err] ${url} ${(e as Error).message}`);
    return null;
  }
}

async function safeText(url: string, init?: RequestInit): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "User-Agent": UA, ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      console.error(`[fetch ${res.status}] ${url}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.error(`[fetch err] ${url} ${(e as Error).message}`);
    return null;
  }
}

// ===== Hacker News =====
export async function fromHN(): Promise<Post[]> {
  const [top, show, ask, job] = await Promise.all([
    topStories(),
    showStories(),
    askStories(),
    jobStories(),
  ]);
  const ids = [
    ...top.slice(0, 25),
    ...show.slice(0, 10),
    ...ask.slice(0, 10),
    ...job.slice(0, 5),
  ];
  const its = await hnItems(Array.from(new Set(ids)));
  return its
    .filter((i) => i && !i.deleted && !i.dead && i.title)
    .map((i) => ({
      source: "hn",
      id: String(i.id),
      title: i.title!,
      url: i.url ?? `https://news.ycombinator.com/item?id=${i.id}`,
      permalink: `https://news.ycombinator.com/item?id=${i.id}`,
      author: i.by,
      score: i.score,
      comments: i.descendants,
      createdAt: i.time ?? 0,
      tags: [i.type ?? "story"],
    }));
}

// ===== Lobsters =====
interface LobsterStory {
  short_id: string;
  created_at: string;
  title: string;
  url: string;
  score: number;
  comment_count: number;
  submitter_user: string;
  tags: string[];
  short_id_url: string;
  comments_url: string;
}
export async function fromLobsters(): Promise<Post[]> {
  const j = await safeJson<LobsterStory[]>("https://lobste.rs/hottest.json");
  if (!j) return [];
  return j.map((s) => ({
    source: "lobsters",
    id: s.short_id,
    title: s.title,
    url: s.url || s.comments_url,
    permalink: s.comments_url,
    author: s.submitter_user,
    score: s.score,
    comments: s.comment_count,
    createdAt: Math.floor(new Date(s.created_at).getTime() / 1000),
    tags: s.tags,
  }));
}

// ===== Reddit =====
interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    selftext?: string;
    subreddit: string;
    over_18: boolean;
    stickied: boolean;
  };
}
interface RedditListing {
  data: { children: RedditPost[] };
}
export async function fromReddit(subs: string[]): Promise<Post[]> {
  const results = await Promise.all(
    subs.map((sub) =>
      safeJson<RedditListing>(`https://www.reddit.com/r/${sub}/hot.json?limit=15`),
    ),
  );
  const posts: Post[] = [];
  for (const r of results) {
    if (!r?.data?.children) continue;
    for (const c of r.data.children) {
      const d = c.data;
      if (d.over_18 || d.stickied) continue;
      const isSelf = d.url.includes("reddit.com");
      posts.push({
        source: `reddit/${d.subreddit}`,
        id: d.id,
        title: d.title,
        url: isSelf ? `https://reddit.com${d.permalink}` : d.url,
        permalink: `https://reddit.com${d.permalink}`,
        author: d.author,
        score: d.score,
        comments: d.num_comments,
        createdAt: d.created_utc,
        text: d.selftext?.slice(0, 500),
        tags: [d.subreddit],
      });
    }
  }
  return posts;
}


// ===== Product Hunt (Algolia public index) =====
interface PHHit {
  objectID: string;
  name: string;
  tagline: string;
  slug: string;
  comments_count: number;
  votes_count?: number;
  reviews_count?: number;
  created_at?: string | number;
  day?: string;
  topics?: { name: string }[];
}
interface AlgoliaResp {
  hits: PHHit[];
}
export async function fromProductHunt(): Promise<Post[]> {
  const r = await safeJson<AlgoliaResp>(
    "https://0h4smabbsg-dsn.algolia.net/1/indexes/Post_production/query",
    {
      method: "POST",
      headers: {
        "X-Algolia-API-Key": "9670d2d619b9d07859448d7628eea5f3",
        "X-Algolia-Application-Id": "0H4SMABBSG",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ params: "query=&hitsPerPage=25" }),
    },
  );
  if (!r?.hits) return [];
  return r.hits.map((h) => {
    let ts = 0;
    if (typeof h.created_at === "number") ts = h.created_at;
    else if (typeof h.created_at === "string") {
      const ms = Date.parse(h.created_at);
      if (!isNaN(ms)) ts = Math.floor(ms / 1000);
    }
    return {
      source: "producthunt",
      id: h.objectID,
      title: `${h.name}: ${h.tagline}`,
      url: `https://www.producthunt.com/posts/${h.slug}`,
      permalink: `https://www.producthunt.com/posts/${h.slug}`,
      score: h.votes_count ?? h.reviews_count,
      comments: h.comments_count,
      createdAt: ts,
      tags: h.topics?.map((t) => t.name),
    };
  });
}

// ===== RSS (generic) =====
// Minimal RSS 2.0 / Atom parser. Regex-based since deps banned.
function parseRSS(xml: string): { title: string; link: string; date: string; author?: string }[] {
  const out: { title: string; link: string; date: string; author?: string }[] = [];
  // RSS 2.0 <item>
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  for (const m of xml.matchAll(itemRe)) {
    const block = m[0];
    const title = extract(block, /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i);
    const link = extract(block, /<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
    const date =
      extract(block, /<pubDate(?:\s[^>]*)?>([\s\S]*?)<\/pubDate>/i) ||
      extract(block, /<dc:date(?:\s[^>]*)?>([\s\S]*?)<\/dc:date>/i);
    const author = extract(block, /<dc:creator(?:\s[^>]*)?>([\s\S]*?)<\/dc:creator>/i);
    if (title && link) out.push({ title, link, date, author });
  }
  // Atom <entry>
  const entryRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
  for (const m of xml.matchAll(entryRe)) {
    const block = m[0];
    const title = extract(block, /<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/i);
    const link = linkMatch ? linkMatch[1] : "";
    const date =
      extract(block, /<updated(?:\s[^>]*)?>([\s\S]*?)<\/updated>/i) ||
      extract(block, /<published(?:\s[^>]*)?>([\s\S]*?)<\/published>/i);
    const author = extract(block, /<name(?:\s[^>]*)?>([\s\S]*?)<\/name>/i);
    if (title && link) out.push({ title, link, date, author });
  }
  return out;
}

function extract(block: string, re: RegExp): string {
  const m = block.match(re);
  if (!m) return "";
  return stripCdata(m[1]).trim();
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

export async function fromRSS(name: string, url: string): Promise<Post[]> {
  const xml = await safeText(url);
  if (!xml) return [];
  const items = parseRSS(xml);
  return items.slice(0, 25).map((it, idx) => ({
    source: `rss/${name}`,
    id: `${name}:${it.link || idx}`,
    title: it.title,
    url: it.link,
    permalink: it.link,
    author: it.author,
    createdAt: it.date ? Math.floor(new Date(it.date).getTime() / 1000) : 0,
  }));
}

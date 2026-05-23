// Hacker News API client. v0 docs: https://github.com/HackerNews/API
// No deps. Bun + fetch.

const BASE = "https://hacker-news.firebaseio.com/v0";

type ItemType = "job" | "story" | "comment" | "poll" | "pollopt";

interface Item {
  id: number;
  deleted?: boolean;
  type?: ItemType;
  by?: string;
  time?: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score?: number;
  title?: string;
  parts?: number[];
  descendants?: number;
}

interface User {
  id: string;
  created?: number;
  karma?: number;
  about?: string;
  submitted?: number[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}.json`);
  if (!res.ok) throw new Error(`HN ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

// Story list endpoints.
const topStories = () => get<number[]>("topstories");
const newStories = () => get<number[]>("newstories");
const bestStories = () => get<number[]>("beststories");
const askStories = () => get<number[]>("askstories");
const showStories = () => get<number[]>("showstories");
const jobStories = () => get<number[]>("jobstories");
const maxItem = () => get<number>("maxitem");
const updates = () => get<{ items: number[]; profiles: string[] }>("updates");

const item = (id: number) => get<Item>(`item/${id}`);
const user = (id: string) => get<User>(`user/${id}`);

// Bounded concurrency map. Default 25 in-flight.
async function pmap<T, U>(
  xs: T[],
  fn: (x: T) => Promise<U>,
  concurrency = 25,
): Promise<U[]> {
  const out: U[] = new Array(xs.length);
  let i = 0;
  const workers = Array(Math.min(concurrency, xs.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const idx = i++;
        if (idx >= xs.length) return;
        out[idx] = await fn(xs[idx]);
      }
    });
  await Promise.all(workers);
  return out;
}

// Fetch many items in parallel.
const items = (ids: number[]) => pmap(ids, item);

// Walk comment tree depth-first. Returns flat list with depth.
async function commentTree(
  rootId: number,
  maxDepth = 3,
): Promise<{ item: Item; depth: number }[]> {
  const out: { item: Item; depth: number }[] = [];
  async function walk(id: number, depth: number) {
    if (depth > maxDepth) return;
    const it = await item(id);
    if (it.deleted || it.dead) return;
    out.push({ item: it, depth });
    if (it.kids?.length) {
      await pmap(it.kids, (k) => walk(k, depth + 1), 10);
    }
  }
  await walk(rootId, 0);
  return out;
}

// Filter: top stories with score >= min, optional keyword in title.
async function filterTop(opts: {
  minScore?: number;
  keyword?: string;
  limit?: number;
}) {
  const { minScore = 0, keyword, limit = 30 } = opts;
  const ids = await topStories();
  const fetched = await items(ids.slice(0, limit));
  const kw = keyword?.toLowerCase();
  return fetched.filter(
    (s) =>
      (s.score ?? 0) >= minScore &&
      (!kw || (s.title ?? "").toLowerCase().includes(kw)),
  );
}

export {
  get,
  topStories,
  newStories,
  bestStories,
  askStories,
  showStories,
  jobStories,
  maxItem,
  updates,
  item,
  items,
  user,
  pmap,
  commentTree,
  filterTop,
};
export type { Item, User, ItemType };

// x-cdp.ts — drive X via puppeteer-core CDP attach to running Brave.
//
// Why puppeteer-core (not Playwright): Playwright's CDP attach hangs on Brave's
// modified Chromium WS handshake. Puppeteer-core handles it cleanly.
//
// Workflow:
//   1. User runs bin/browser-up.sh ONCE — relaunches Brave with --remote-debugging-port=9222
//      using their real profile (real cookies, real X session, real extensions).
//   2. post-x.ts connects via puppeteer-core, finds/opens an x.com tab, drives it.
//   3. Brave stays open. User keeps using it normally.

import puppeteer, { type Browser, type Page } from "puppeteer-core";

const DEFAULT_PORT = Number(process.env.X_DEBUG_PORT ?? 9222);

export function getDebugPort(): number {
  return DEFAULT_PORT;
}

async function isPortUp(port: number): Promise<boolean> {
  try {
    const r = await fetch(`http://localhost:${port}/json/version`);
    return r.ok;
  } catch {
    return false;
  }
}

async function connect(): Promise<Browser> {
  const port = getDebugPort();
  if (!(await isPortUp(port))) {
    throw new Error(
      `Brave/Chrome debug port ${port} not reachable.\n` +
        `Run once: bash bin/browser-up.sh\n` +
        `(this relaunches Brave with debug port + your real profile, no login needed)`,
    );
  }
  return puppeteer.connect({
    browserURL: `http://localhost:${port}`,
    defaultViewport: null,
  });
}

async function findOrOpenXPage(browser: Browser, url: string): Promise<{ page: Page; wasNew: boolean }> {
  const pages = await browser.pages();
  for (const p of pages) {
    if (/^https:\/\/(x|twitter)\.com\//.test(p.url())) {
      await p.bringToFront();
      if (!p.url().startsWith(url)) {
        await p.goto(url, { waitUntil: "domcontentloaded" });
      }
      return { page: p, wasNew: false };
    }
  }
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  return { page, wasNew: true };
}

export interface XCdpPostOptions {
  text: string;
  replyToUrl?: string;
  timeoutMs?: number;
  keepTabOpen?: boolean;
}

export interface XCdpPostResult {
  url: string;
}

// Open compose. Force the MODAL composer (not inline) by navigating to
// /compose/post which always opens a clean modal. Avoids picking up the home
// page's inline composer + share menus + sidebar buttons.
async function openComposeModal(page: Page): Promise<void> {
  await page.goto("https://x.com/compose/post", { waitUntil: "domcontentloaded" });
  // Wait for the modal dialog.
  await page.waitForSelector('[role="dialog"] [data-testid="tweetTextarea_0"]', {
    timeout: 15000,
    visible: true,
  });
}

async function typeIntoModalTextbox(page: Page, text: string): Promise<void> {
  const tb = await page.waitForSelector(
    '[role="dialog"] [data-testid="tweetTextarea_0"]',
    { timeout: 15000, visible: true },
  );
  if (!tb) throw new Error("no modal tweet textbox");
  await tb.click();
  await page.keyboard.type(text, { delay: 12 });
}

async function clickModalPostButton(page: Page): Promise<void> {
  // Inside the open modal, the post button is data-testid="tweetButton".
  // Scope to dialog to avoid hitting inline composer / share buttons on the page.
  const btn = await page.waitForSelector(
    '[role="dialog"] [data-testid="tweetButton"]',
    { timeout: 15000, visible: true },
  );
  if (!btn) throw new Error("no modal post button");
  // Ensure enabled (X disables when empty / over limit).
  const disabled = await page.evaluate(
    (el) => (el as HTMLButtonElement).getAttribute("aria-disabled") === "true",
    btn,
  );
  if (disabled) throw new Error("post button is disabled (empty or over-limit?)");
  await btn.click();
}

async function waitForPostConfirmation(page: Page): Promise<string | undefined> {
  // Toast with link to the new post.
  try {
    const link = await page.waitForSelector(
      'div[role="alert"] a[href*="/status/"]',
      { timeout: 12000, visible: true },
    );
    if (link) {
      const href = await page.evaluate((el) => (el as HTMLAnchorElement).getAttribute("href"), link);
      if (href) return href.startsWith("http") ? href : `https://x.com${href}`;
    }
  } catch {}
  // Fallback: URL navigated to status page.
  try {
    await page.waitForFunction(() => /\/status\/\d+/.test(location.href), { timeout: 5000 });
    return page.url();
  } catch {}
  return undefined;
}

export async function xPostViaCdp(opts: XCdpPostOptions): Promise<XCdpPostResult> {
  const browser = await connect();
  let opened: Page | undefined;
  try {
    // For replies: navigate to the target tweet and click Reply.
    // For new posts: navigate to /compose/post (clean modal, no inline conflicts).
    const targetUrl = opts.replyToUrl ?? "https://x.com/compose/post";
    const { page, wasNew } = await findOrOpenXPage(browser, targetUrl);
    if (wasNew) opened = page;
    if (opts.timeoutMs) page.setDefaultTimeout(opts.timeoutMs);

    if (/\/i\/flow\/login|\/login/.test(page.url())) {
      throw new Error("Brave not logged in to X. Log in via the Brave window, then retry.");
    }

    if (opts.replyToUrl) {
      // On the tweet page, click the Reply button to open the inline reply composer.
      const reply = await page.waitForSelector('[data-testid="reply"]', { timeout: 10000, visible: true });
      if (!reply) throw new Error("could not locate Reply button on target tweet");
      await reply.click();
      // Reply also opens a modal dialog with tweetTextarea_0.
      await page.waitForSelector('[role="dialog"] [data-testid="tweetTextarea_0"]', {
        timeout: 15000,
        visible: true,
      });
    } else {
      // /compose/post opens directly into modal; just confirm it's there.
      await openComposeModal(page);
    }

    await typeIntoModalTextbox(page, opts.text);
    await clickModalPostButton(page);

    const url = await waitForPostConfirmation(page);
    if (!url) {
      throw new Error("post button clicked but no confirmation detected. Check x.com manually.");
    }
    return { url };
  } finally {
    if (opened && !opts.keepTabOpen) {
      // Give user a moment to see confirmation before closing.
      await new Promise((r) => setTimeout(r, 1500));
      try {
        await opened.close();
      } catch {}
    }
    await browser.disconnect();
  }
}

export async function xPostThreadViaCdp(texts: string[]): Promise<XCdpPostResult[]> {
  const out: XCdpPostResult[] = [];
  let prevUrl: string | undefined;
  for (const t of texts) {
    const r = await xPostViaCdp({ text: t, replyToUrl: prevUrl });
    out.push(r);
    prevUrl = r.url;
  }
  return out;
}

export async function xCheckSession(): Promise<
  { ok: true; pageCount: number; xTabs: number } | { ok: false; reason: string }
> {
  try {
    const port = getDebugPort();
    if (!(await isPortUp(port))) {
      return { ok: false, reason: `debug port ${port} not reachable. Run: bash bin/browser-up.sh` };
    }
    const browser = await connect();
    const pages = await browser.pages();
    const xTabs = pages.filter((p) => /^https:\/\/(x|twitter)\.com\//.test(p.url())).length;
    await browser.disconnect();
    return { ok: true, pageCount: pages.length, xTabs };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

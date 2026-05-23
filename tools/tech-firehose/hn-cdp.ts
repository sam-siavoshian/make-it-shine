// hn-cdp.ts — submit to Hacker News via puppeteer-core CDP attach to running Brave.
//
// Workflow (same as X):
//   1. User runs bin/browser-up.sh ONCE — relaunches Brave with debug port + real profile.
//   2. post-hn.ts attaches via CDP and drives news.ycombinator.com/submit.
//   3. Brave stays open. User's real HN session = no login, no password handling.

import puppeteer, { type Browser, type Page } from "puppeteer-core";

const DEFAULT_PORT = Number(process.env.X_DEBUG_PORT ?? 9222);
const HN_BASE = "https://news.ycombinator.com";

async function isPortUp(port: number): Promise<boolean> {
  try {
    const r = await fetch(`http://localhost:${port}/json/version`);
    return r.ok;
  } catch {
    return false;
  }
}

async function connect(): Promise<Browser> {
  if (!(await isPortUp(DEFAULT_PORT))) {
    throw new Error(
      `Brave debug port ${DEFAULT_PORT} not reachable.\n` +
        `Run once: bash bin/browser-up.sh\n` +
        `(relaunches Brave with debug port + your real profile; HN session reused)`,
    );
  }
  return puppeteer.connect({
    browserURL: `http://localhost:${DEFAULT_PORT}`,
    defaultViewport: null,
  });
}

async function findOrOpenHNPage(browser: Browser, url: string): Promise<{ page: Page; wasNew: boolean }> {
  const pages = await browser.pages();
  for (const p of pages) {
    if (/^https?:\/\/news\.ycombinator\.com/.test(p.url())) {
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

export interface HNCdpSubmitOptions {
  title: string;
  url?: string;
  text?: string;
  timeoutMs?: number;
  keepTabOpen?: boolean;
}

export interface HNCdpSubmitResult {
  itemId?: string;
  url: string;
  warning?: string;
}

export async function hnSubmitViaCdp(opts: HNCdpSubmitOptions): Promise<HNCdpSubmitResult> {
  if (!opts.title || opts.title.length > 80) {
    throw new Error(`HN title must be 1-80 chars, got ${opts.title?.length ?? 0}`);
  }
  if (!opts.url && !opts.text) throw new Error("HN submit needs url OR text");
  if (opts.url && opts.text) throw new Error("HN: url OR text, not both");

  const browser = await connect();
  let opened: Page | undefined;
  try {
    const { page, wasNew } = await findOrOpenHNPage(browser, `${HN_BASE}/submit`);
    if (wasNew) opened = page;
    if (opts.timeoutMs) page.setDefaultTimeout(opts.timeoutMs);

    if (/\/login/.test(page.url())) {
      throw new Error("Not logged in to HN. Log in via the Brave window, then retry.");
    }

    const titleInput = await page.waitForSelector('input[name="title"]', { timeout: 10000, visible: true });
    if (!titleInput) throw new Error("could not find title input — HN form structure changed?");

    await titleInput.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await titleInput.type(opts.title, { delay: 8 });

    if (opts.url) {
      const urlInput = await page.waitForSelector('input[name="url"]', { timeout: 5000, visible: true });
      if (!urlInput) throw new Error("could not find url input");
      await urlInput.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await urlInput.type(opts.url, { delay: 8 });
    } else if (opts.text) {
      const textArea = await page.waitForSelector('textarea[name="text"]', { timeout: 5000, visible: true });
      if (!textArea) throw new Error("could not find text textarea");
      await textArea.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await textArea.type(opts.text, { delay: 6 });
    }

    const submitBtn = await page.waitForSelector('input[type="submit"][value="submit"]', {
      timeout: 5000,
      visible: true,
    });
    if (!submitBtn) throw new Error("could not find submit button");

    const navP = page.waitForNavigation({ timeout: 20000, waitUntil: "domcontentloaded" });
    await submitBtn.click();
    await navP;

    const finalUrl = page.url();

    const bodyText: string = await page.evaluate(() => document.body.innerText.slice(0, 500));
    if (bodyText.includes("That site has been banned"))
      throw new Error("HN: that site/domain is banned from submissions");
    if (bodyText.includes("Please confirm") || /\/confirm/.test(finalUrl))
      throw new Error("HN: confirmation page hit (dupe / similar URL exists)");
    if (/\/login/.test(finalUrl))
      throw new Error("HN: bounced to login mid-submit (session expired?)");

    const itemMatch = finalUrl.match(/[?&]id=(\d+)/);
    if (itemMatch) {
      return { itemId: itemMatch[1], url: finalUrl };
    }
    if (/\/newest/.test(finalUrl)) {
      // Try to find our just-submitted item in the first few rows on /newest.
      try {
        const rows = await page.$$("tr.athing");
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const row = rows[i];
          const id: string = await page.evaluate((el) => (el as HTMLElement).id, row);
          const title: string = await page.evaluate(
            (el) => (el as HTMLElement).querySelector(".titleline a")?.textContent ?? "",
            row,
          );
          if (title === opts.title) {
            return { itemId: id, url: `${HN_BASE}/item?id=${id}` };
          }
        }
      } catch {}
      return {
        url: finalUrl,
        warning: "redirected to /newest — submission may have been throttled or marked spam. Verify on HN.",
      };
    }
    return { url: finalUrl, warning: `unexpected post-submit URL: ${finalUrl}` };
  } finally {
    if (opened && !opts.keepTabOpen) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        await opened.close();
      } catch {}
    }
    await browser.disconnect();
  }
}

export async function hnCheckSession(): Promise<
  { ok: true; loggedInAs?: string } | { ok: false; reason: string }
> {
  try {
    if (!(await isPortUp(DEFAULT_PORT))) {
      return { ok: false, reason: `debug port ${DEFAULT_PORT} not reachable. Run: bash bin/browser-up.sh` };
    }
    const browser = await connect();
    try {
      const page = await browser.newPage();
      await page.goto(`${HN_BASE}/news`, { waitUntil: "domcontentloaded" });
      const userLink = await page.$('a[href^="user?id="]#me');
      let user: string | undefined;
      if (userLink) {
        user = (await page.evaluate((el) => el.textContent, userLink)) ?? undefined;
      }
      await page.close();
      await browser.disconnect();
      if (user) return { ok: true, loggedInAs: user };
      return { ok: false, reason: "Brave is not logged in to HN. Log in via the Brave window." };
    } catch (e) {
      await browser.disconnect();
      throw e;
    }
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}

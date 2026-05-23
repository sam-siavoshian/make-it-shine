// posters.ts — text splitters shared by post-* CLIs.
//
// Posting itself lives in CDP-driven modules:
//   - X:  x-cdp.ts (puppeteer-core attach to running Brave)
//   - HN: hn-cdp.ts (same browser, real HN session)

// Generic text splitter. Breaks on paragraph → sentence → word.
// Appends "(N/M)" suffix to each chunk when more than one.
export function splitForThread(text: string, maxLen = 270): string[] {
  if (text.length <= maxLen + 10) return [text];
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";

  function flush() {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  }

  for (const p of paragraphs) {
    if ((cur + "\n\n" + p).length <= maxLen) {
      cur = cur ? cur + "\n\n" + p : p;
    } else if (p.length <= maxLen) {
      flush();
      cur = p;
    } else {
      flush();
      const sentences = p.split(/(?<=[.!?])\s+/);
      for (const s of sentences) {
        if ((cur + " " + s).length <= maxLen) {
          cur = cur ? cur + " " + s : s;
        } else if (s.length <= maxLen) {
          flush();
          cur = s;
        } else {
          flush();
          const words = s.split(/\s+/);
          for (const w of words) {
            if ((cur + " " + w).length <= maxLen) {
              cur = cur ? cur + " " + w : w;
            } else {
              flush();
              cur = w;
            }
          }
        }
      }
    }
  }
  flush();

  const total = chunks.length;
  if (total === 1) return chunks;
  return chunks.map((c, i) => `${c} (${i + 1}/${total})`);
}

// X cap is 280 chars; reserve room for "(n/m)" suffix.
export function splitForX(text: string, maxLen = 270): string[] {
  return splitForThread(text, maxLen);
}

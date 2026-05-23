# Contributing

PRs welcome. Issues too.

## Dev setup

```bash
git clone https://github.com/sam-siavoshian/make-it-shine
cd make-it-shine/tools/tech-firehose
bun install
```

## Run the CLI

```bash
bun run bin/fetch-all.ts --limit=5             # smoke test reads
bun run bin/post-x.ts --text="hi"              # dry-run, no --yes
```

## Run the skill

Copy SKILL.md + scripts/ + references/ into `~/.claude/skills/make-it-shine/`. Restart Claude Code. Trigger by saying "polish this repo" or similar.

## Style

- TypeScript for tools/. Bun-native APIs (`Bun.file`, `Bun.spawn`) where possible.
- Bash for skill scripts. POSIX-compatible, `set -u` + `set -o pipefail`.
- No em dashes anywhere. Use commas, periods, parens.
- No AI vocab in user-facing strings (delve, crucial, robust, leverage, foster, landscape).
- Atomic commits. One concern per commit.
- Never `--no-verify`. Never co-author.

## PR checklist

- [ ] New post-* scripts default to dry-run (`--yes` required to send)
- [ ] New CLI scripts have `--help` output
- [ ] New skill phases tagged with which mode(s) they run in
- [ ] README updated if user-facing surface changed

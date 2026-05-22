# Visual QA (local / agent)

This folder is **not** part of the pnpm workspace. Install Playwright here with npm:

```bash
cd tools/visual-qa
npm install
npx playwright install chromium
```

From repo root:

```bash
pnpm verify:visual
```

Requires `pnpm dev:admin` and `pnpm dev:api` while capturing mobile web screenshots.

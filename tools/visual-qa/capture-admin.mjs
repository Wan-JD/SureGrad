import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(repoRoot, "docs", ".visual-qa");
const baseUrl = process.env.ADMIN_BASE_URL ?? "http://localhost:3001";

const pages = [
  {
    name: "admin-home",
    url: "/",
    mustSee: ["采集缺口", "华东理工", "上海财经"],
    waitFor: ".batch-gaps-banner",
  },
  {
    name: "admin-yearly-data",
    url: "/yearly-data",
    mustSee: ["年度数据 CSV 缺口", "采集缺口", "待补 CSV"],
    waitFor: ".batch-gaps-banner",
  },
  {
    name: "admin-resources",
    url: "/resources",
    mustSee: ["资料", "资料推荐"],
    waitFor: ".record-table",
  },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const failures = [];

for (const target of pages) {
  await page.goto(`${baseUrl}${target.url}`, { waitUntil: "domcontentloaded" });
  if (target.waitFor) {
    await page.waitForSelector(target.waitFor, { timeout: 15000 });
  }
  await page.waitForTimeout(500);

  const text = await page.locator("body").innerText();
  for (const phrase of target.mustSee) {
    if (!text.includes(phrase)) {
      failures.push(`${target.name}: missing "${phrase}"`);
    }
  }

  await page.screenshot({
    path: path.join(outDir, `${target.name}.png`),
    fullPage: true,
  });
}

await browser.close();

if (failures.length > 0) {
  console.error("Visual QA failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Visual QA passed. Screenshots in ${outDir}`);

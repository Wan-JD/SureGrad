import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(repoRoot, "docs", ".visual-qa");
const baseUrl = process.env.ADMIN_BASE_URL ?? "http://localhost:3001";

const VIEWPORTS = [
  { key: "desktop", width: 1440, height: 900 },
  { key: "tablet", width: 834, height: 1194 },
  { key: "mobile", width: 390, height: 844 },
];

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
  {
    name: "admin-schools",
    url: "/schools",
    mustSee: ["学校管理", "学校档案"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-programs",
    url: "/programs",
    mustSee: ["专业管理", "专业"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-departments",
    url: "/departments",
    mustSee: ["院系管理", "院系列表"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-source-links",
    url: "/source-links",
    mustSee: ["来源链接管理", "来源链接"],
    waitFor: ".workspace-hero",
  },
];

fs.mkdirSync(outDir, { recursive: true });

function waitSelectorsFor(target) {
  if (!target.waitFor) {
    return [];
  }
  if (target.name === "admin-resources") {
    return [
      ".record-table tbody tr",
      ".record-table",
      ".record-list-panel",
      ".workspace-hero",
    ];
  }
  if (
    target.name === "admin-schools" ||
    target.name === "admin-programs" ||
    target.name === "admin-departments" ||
    target.name === "admin-source-links"
  ) {
    return [
      ".record-table tbody tr",
      ".record-table",
      ".record-list-panel",
      ".workspace-hero",
    ];
  }
  return [target.waitFor];
}

async function waitForPageReady(page, target, viewportKey) {
  const selectors = waitSelectorsFor(target);
  if (selectors.length === 0) {
    return;
  }

  let lastError;
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, {
        timeout:
          target.name === "admin-resources" ||
          target.name === "admin-schools" ||
          target.name === "admin-programs" ||
          target.name === "admin-departments" ||
          target.name === "admin-source-links"
            ? 25000
            : 15000,
        state: "attached",
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error(`${target.name} (${viewportKey}): no selector matched`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const failures = [];

for (const target of pages) {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${baseUrl}${target.url}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page, target, viewport.key);
    if (target.name === "admin-resources") {
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(500);

    const text = await page.locator("body").innerText();
    for (const phrase of target.mustSee) {
      if (!text.includes(phrase)) {
        failures.push(`${target.name} (${viewport.key}): missing "${phrase}"`);
      }
    }

    await page.screenshot({
      path: path.join(outDir, `${target.name}-${viewport.key}.png`),
      fullPage: true,
    });
  }
}

await browser.close();

if (failures.length > 0) {
  console.error("Visual QA failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Visual QA passed. Screenshots in ${outDir}`);

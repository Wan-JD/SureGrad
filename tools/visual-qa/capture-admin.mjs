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

async function loginAsSuperAdmin(page) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector(".admin-login-form", { timeout: 15000 });
  await page.fill('input[name="username"]', "superadmin");
  await page.fill('input[name="password"]', "super123");

  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/admin/auth/login") && response.ok(),
    { timeout: 20000 },
  );

  await page.click("button.admin-login-submit");
  await loginResponse;

  await page.waitForURL((url) => url.pathname === "/users", {
    timeout: 20000,
  });
}

const pages = [
  {
    name: "admin-users",
    url: "/users",
    mustSee: ["鐢ㄦ埛绠＄悊", "App 鐢ㄦ埛"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-admins",
    url: "/admins",
    mustSee: ["绠＄悊鍛樿处鍙?, "鍚庡彴璐﹀彿"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-home",
    url: "/",
    mustSee: ["鐢ㄦ埛绠＄悊", "App 鐢ㄦ埛"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-yearly-data",
    url: "/yearly-data",
    mustSee: ["骞村害鏁版嵁 CSV 缂哄彛", "鎷涚敓璁″垝", "鍒嗘暟绾?, "鍗庝笢鐞嗗伐"],
    waitFor: ".batch-gaps-banner",
  },
  {
    name: "admin-resources",
    url: "/resources",
    mustSee: ["璧勬枡", "璧勬枡鎺ㄨ崘"],
    waitFor: ".record-table",
  },
  {
    name: "admin-schools",
    url: "/schools",
    mustSee: ["瀛︽牎绠＄悊", "鍐欐帴鍙?],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-programs",
    url: "/programs",
    mustSee: ["涓撲笟绠＄悊", "涓撲笟"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-departments",
    url: "/departments",
    mustSee: ["闄㈢郴绠＄悊", "闄㈢郴鍒楄〃", "淇℃伅绉戝", "鍗庝笢鐞嗗伐"],
    waitFor: ".workspace-hero",
  },
  {
    name: "admin-source-links",
    url: "/source-links",
    mustSee: ["鏉ユ簮閾炬帴绠＄悊", "鏉ユ簮閾炬帴"],
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
    target.name === "admin-users" ||
    target.name === "admin-admins" ||
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
          target.name === "admin-users" ||
          target.name === "admin-admins" ||
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

await loginAsSuperAdmin(page);

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

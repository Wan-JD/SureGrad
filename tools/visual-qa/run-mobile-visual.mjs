import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const mobileDir = path.join(repoRoot, "apps", "mobile");
const outDir = path.join(repoRoot, "docs", ".visual-qa");

const MOBILE_VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };
const TABLET_VIEWPORT = { width: 834, height: 1194, deviceScaleFactor: 2 };

function run(command, args, cwd = repoRoot) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function withStaticServer(dir, port, handler) {
  const server = spawn("npx", ["--yes", "serve", "-s", "-l", String(port), "."], {
    cwd: dir,
    shell: true,
    stdio: "ignore",
  });

  let ready = false;
  for (let attempt = 0; attempt < 45; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // keep waiting for static server
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!ready) {
    server.kill("SIGTERM");
    throw new Error(`Static server did not become ready on port ${port} (${dir})`);
  }

  try {
    await handler(`http://127.0.0.1:${port}`);
  } finally {
    server.kill("SIGTERM");
  }
}

function capturePlansFor(target) {
  const plans = [{ suffix: "", viewport: MOBILE_VIEWPORT }];
  if (
    target.name === "mobile-guest-schools-tab" ||
    target.name === "mobile-guest-home-tab" ||
    target.name === "mobile-guest-comparison" ||
    target.name === "mobile-guest-planning-tab" ||
    target.name === "mobile-guest-resources-tab"
  ) {
    plans.push({ suffix: "-tablet", viewport: TABLET_VIEWPORT });
  }
  return plans;
}

async function collectPageText(page) {
  return page.evaluate(() => {
    const parts = [];
    for (const element of document.querySelectorAll(
      "flt-semantics, [aria-label], [role='heading'], [role='button']",
    )) {
      const aria = element.getAttribute("aria-label")?.trim();
      const text = element.textContent?.trim();
      if (aria) {
        parts.push(aria);
      }
      if (text) {
        parts.push(text);
      }
    }
    const bodyText = document.body?.innerText?.trim();
    if (bodyText) {
      parts.push(bodyText);
    }
    return parts.join("\n");
  });
}

async function waitForFlutterSurface(page, label) {
  try {
    await page.waitForFunction(
      () => {
        const semantics = document.querySelectorAll("flt-semantics").length;
        const text = document.body?.innerText?.trim() ?? "";
        return semantics > 0 || text.length >= 12;
      },
      { timeout: 45000 },
    );
  } catch {
    throw new Error(`${label}: Flutter surface did not render in time`);
  }
}

function assertMustSeeAny(text, phrases, label) {
  const normalized = text.replace(/\s+/g, "");
  if (normalized.length < 4) {
    throw new Error(`${label}: blank or white screen`);
  }

  const matched = phrases.some((phrase) => text.includes(phrase));
  if (!matched) {
    throw new Error(
      `${label}: expected one of [${phrases.join(", ")}], page text was too short or unrelated`,
    );
  }
}

fs.mkdirSync(outDir, { recursive: true });

const apiDefine = [
  "--dart-define=SUREGRAD_API_BASE_URL=http://127.0.0.1:3000/api/v1",
];

async function resolveProgramId() {
  try {
    const schoolsResponse = await fetch("http://127.0.0.1:3000/api/v1/schools");
    if (!schoolsResponse.ok) {
      return "";
    }
    const schoolsJson = await schoolsResponse.json();
    const schoolId = schoolsJson.items?.[0]?.schoolId;
    if (!schoolId) {
      return "";
    }

    const programsResponse = await fetch(
      `http://127.0.0.1:3000/api/v1/schools/${schoolId}/programs`,
    );
    if (!programsResponse.ok) {
      return "";
    }
    const programsJson = await programsResponse.json();
    return programsJson.items?.[0]?.programId ?? "";
  } catch {
    return "";
  }
}

const programId = await resolveProgramId();
const programDefine = programId
  ? [`--dart-define=SUREGRAD_PROGRAM_ID=${programId}`]
  : [];

run("flutter", ["build", "web", ...apiDefine], mobileDir);
run(
  "flutter",
  ["build", "web", "-t", "lib/main_visual_qa_splash.dart", "-o", "build/web-splash"],
  mobileDir,
);
run(
  "flutter",
  [
    "build",
    "web",
    "-t",
    "lib/main_visual_qa_home.dart",
    "-o",
    "build/web-home",
    ...apiDefine,
  ],
  mobileDir,
);
run(
  "flutter",
  [
    "build",
    "web",
    "-t",
    "lib/main_visual_qa_planning.dart",
    "-o",
    "build/web-planning",
    ...apiDefine,
  ],
  mobileDir,
);
run(
  "flutter",
  [
    "build",
    "web",
    "-t",
    "lib/main_visual_qa_resources.dart",
    "-o",
    "build/web-resources",
    ...apiDefine,
  ],
  mobileDir,
);
run(
  "flutter",
  [
    "build",
    "web",
    "-t",
    "lib/main_visual_qa_comparison.dart",
    "-o",
    "build/web-comparison",
    ...apiDefine,
  ],
  mobileDir,
);
run(
  "flutter",
  [
    "build",
    "web",
    "-t",
    "lib/main_visual_qa_program.dart",
    "-o",
    "build/web-program",
    ...apiDefine,
    ...programDefine,
  ],
  mobileDir,
);

const browser = await chromium.launch();
const page = await browser.newPage(MOBILE_VIEWPORT);

const targets = [
  {
    name: "mobile-guest-schools-tab",
    dir: path.join(mobileDir, "build", "web"),
    port: 7357,
    path: "/",
    mustSeeAny: ["择校", "院校列表加载失败", "筛选", "先把候选池缩窄"],
  },
  {
    name: "mobile-splash-guest",
    dir: path.join(mobileDir, "build", "web-splash"),
    port: 7358,
    path: "/",
    mustSeeAny: ["SureGrad", "浏览院校", "登录", "择校"],
  },
  {
    name: "mobile-guest-home-tab",
    dir: path.join(mobileDir, "build", "web-home"),
    port: 7361,
    path: "/",
    mustSeeAny: ["首页", "首页状态加载失败", "主链路状态", "还没进入主链路"],
  },
  {
    name: "mobile-guest-comparison",
    dir: path.join(mobileDir, "build", "web-comparison"),
    port: 7362,
    path: "/",
    mustSeeAny: [
      "专业对比",
      "对比中心暂时不可用",
      "比较池还是空的",
      "重试",
    ],
  },
  {
    name: "mobile-guest-planning-tab",
    dir: path.join(mobileDir, "build", "web-planning"),
    port: 7359,
    path: "/",
    mustSeeAny: ["规划", "规划加载失败", "备考阶段", "重试"],
  },
  {
    name: "mobile-guest-resources-tab",
    dir: path.join(mobileDir, "build", "web-resources"),
    port: 7360,
    path: "/",
    mustSeeAny: ["资料", "备考资料", "资料中心暂时不可用", "重试"],
  },
  {
    name: "mobile-program-detail",
    dir: path.join(mobileDir, "build", "web-program"),
    port: 7363,
    path: "/",
    mustSeeAny: [
      "专业详情",
      "专业详情加载失败",
      "计算机科学与技术",
      "历年分数线",
      "加入对比",
      "重试",
    ],
  },
];

const failures = [];

for (const target of targets) {
  await withStaticServer(target.dir, target.port, async (baseUrl) => {
    for (const plan of capturePlansFor(target)) {
      const label = `${target.name}${plan.suffix}`;
      try {
        await page.setViewportSize({
          width: plan.viewport.width,
          height: plan.viewport.height,
        });
        await page.goto(`${baseUrl}${target.path}`, {
          waitUntil: "networkidle",
          timeout: 90000,
        });
        await waitForFlutterSurface(page, label);
        await page.waitForTimeout(1500);

        const text = await collectPageText(page);
        if (target.mustSeeAny) {
          assertMustSeeAny(text, target.mustSeeAny, label);
        }

        await page.screenshot({
          path: path.join(outDir, `${label}.png`),
          fullPage: true,
        });
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
  });
}

await browser.close();

if (failures.length > 0) {
  console.error("Mobile visual QA failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Mobile visual screenshots saved to ${outDir}`);

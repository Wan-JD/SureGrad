import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const mobileDir = path.join(repoRoot, "apps", "mobile");
const outDir = path.join(repoRoot, "docs", ".visual-qa");

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

fs.mkdirSync(outDir, { recursive: true });

const apiDefine = [
  "--dart-define=SUREGRAD_API_BASE_URL=http://127.0.0.1:3000/api/v1",
];

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

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

const targets = [
  {
    name: "mobile-guest-schools-tab",
    dir: path.join(mobileDir, "build", "web"),
    port: 7357,
    path: "/",
  },
  {
    name: "mobile-splash-guest",
    dir: path.join(mobileDir, "build", "web-splash"),
    port: 7358,
    path: "/",
  },
  {
    name: "mobile-guest-planning-tab",
    dir: path.join(mobileDir, "build", "web-planning"),
    port: 7359,
    path: "/",
  },
  {
    name: "mobile-guest-resources-tab",
    dir: path.join(mobileDir, "build", "web-resources"),
    port: 7360,
    path: "/",
  },
];

for (const target of targets) {
  await withStaticServer(target.dir, target.port, async (baseUrl) => {
    await page.goto(`${baseUrl}${target.path}`, {
      waitUntil: "networkidle",
      timeout: 90000,
    });
    await page.waitForTimeout(5000);
    await page.screenshot({
      path: path.join(outDir, `${target.name}.png`),
      fullPage: true,
    });
  });
}

await browser.close();
console.log(`Mobile visual screenshots saved to ${outDir}`);

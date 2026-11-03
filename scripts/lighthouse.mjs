import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import { launch } from "chrome-launcher";
import { config } from "dotenv";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

config({ quiet: true });

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      desktop: { type: "boolean", default: false },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`Usage: npm run test:performance -- [/path] [--desktop]

Audits an authenticated page (default: /) using mobile performance settings.
Start the app first: npm run build && npm start

Environment (.env is loaded automatically):
  LIGHTHOUSE_BASE_URL  Local app URL (default: http://localhost:3001)
  LIGHTHOUSE_EMAIL     Login email (default: INITIAL_ADMIN_EMAIL)
  LIGHTHOUSE_PASSWORD  Login password (default: INITIAL_ADMIN_PASSWORD)
  CHROME_PATH          Optional Chrome executable path

HTML and JSON reports are saved to lighthouse-reports/.`);
    return;
  }

  if (positionals.length > 1) throw new Error("Provide one page path, e.g. /clani.");
  const baseURL = new URL(process.env.LIGHTHOUSE_BASE_URL ?? "http://localhost:3001");
  if (!['http:', 'https:'].includes(baseURL.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(baseURL.hostname) ||
      baseURL.username || baseURL.password) {
    throw new Error("LIGHTHOUSE_BASE_URL must point to the local school app.");
  }
  const targetURL = new URL(positionals[0] ?? "/", baseURL);
  if (targetURL.origin !== baseURL.origin || targetURL.pathname === "/prijava") {
    throw new Error("Provide an authenticated page on the same local app, e.g. /clani.");
  }
  targetURL.hash = "";

  const email = process.env.LIGHTHOUSE_EMAIL ?? process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.LIGHTHOUSE_PASSWORD ?? process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set INITIAL_ADMIN_EMAIL/PASSWORD or LIGHTHOUSE_EMAIL/PASSWORD in .env.");
  }

  const loginURL = new URL("/prijava", baseURL).href;
  try {
    const response = await fetch(loginURL, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await response.body?.cancel();
  } catch {
    throw new Error(`App unavailable at ${baseURL.origin}. Start it with npm run build && npm start.`);
  }

  const chrome = await launch({ chromeFlags: ["--headless=new"] });
  let browser;
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);
    // The default context shares its cookies with Lighthouse's new tab.
    const context = browser.contexts()[0];
    const page = await context.newPage();
    page.setDefaultTimeout(30_000);
    console.log("Signing in to the school app...");
    await page.goto(loginURL);
    await page.getByLabel("E-pošta").fill(email);
    await page.getByLabel("Geslo", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Prijava", exact: true }).click();
    try {
      await page.getByRole("heading", { name: "Nadzorna plošča", exact: true }).waitFor();
    } catch {
      throw new Error("Login failed. Check the account credentials and whether a password change is required.");
    }

    // Warm the target route before measuring (also useful with next dev).
    const response = await page.goto(targetURL.href);
    if (!response?.ok() || new URL(page.url()).pathname !== targetURL.pathname) {
      throw new Error("Target page is unavailable or redirected. Check the path and account permissions.");
    }
    await page.close();

    console.log(`Measuring ${targetURL.href} (${values.desktop ? "desktop" : "mobile"})...`);
    const result = await lighthouse(targetURL.href, {
      port: chrome.port,
      disableStorageReset: true,
      onlyCategories: ["performance"],
      output: ["html", "json"],
      logLevel: "error",
    }, values.desktop ? desktopConfig : undefined);

    if (!result) throw new Error("Lighthouse returned no result.");
    const { lhr, report } = result;
    if (lhr.runtimeError) throw new Error(`Lighthouse: ${lhr.runtimeError.message}`);
    const measuredURL = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl);
    if (measuredURL.origin !== targetURL.origin || measuredURL.pathname !== targetURL.pathname) {
      throw new Error("Lighthouse was redirected away from the target page; no report saved.");
    }

    const directory = resolve("lighthouse-reports");
    await mkdir(directory, { recursive: true });
    const slug = targetURL.pathname.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "") || "dashboard";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const basename = resolve(directory, `${slug}-${values.desktop ? "desktop" : "mobile"}-${timestamp}`);
    await Promise.all([
      writeFile(`${basename}.html`, report[0]),
      writeFile(`${basename}.json`, report[1]),
    ]);

    const score = lhr.categories.performance.score;
    console.log(`Performance: ${score === null ? "unavailable" : Math.round(score * 100) + "/100"}`);
    for (const id of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"]) {
      const audit = lhr.audits[id];
      console.log(`${audit.title}: ${audit.displayValue ?? "unavailable"}`);
    }
    console.log(`HTML: ${basename}.html\nJSON: ${basename}.json`);
  } finally {
    try {
      await browser?.close();
    } finally {
      await chrome.kill();
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

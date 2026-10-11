import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const cli = process.argv[2];
if (!cli || !existsSync(cli)) {
  throw new Error("Pass the installed Mermaid CLI path. See docs/DIAGRAMI.md.");
}
if (!existsSync(chromium.executablePath())) {
  throw new Error("Install Chromium first: npx playwright install chromium");
}

const diagramDirectory = fileURLToPath(new URL("../docs/diagrams/", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "school-diagrams-"));
const browserConfig = join(temporary, "puppeteer.json");
writeFileSync(browserConfig, JSON.stringify({
  executablePath: chromium.executablePath(),
  headless: true,
}), { mode: 0o600 });

try {
  const sources = readdirSync(diagramDirectory).filter((file) => file.endsWith(".mmd")).sort();
  for (const source of sources) {
    for (const format of ["svg", "png"]) {
      const output = join(diagramDirectory, source.replace(/\.mmd$/, `.${format}`));
      execFileSync(cli, [
        "-i", join(diagramDirectory, source),
        "-o", output,
        "-c", join(diagramDirectory, "mermaid-config.json"),
        "-p", browserConfig,
        "-b", "white",
        "--size", "1800",
        "-s", format === "png" ? "2" : "1",
      ], { stdio: "inherit" });
    }
  }
  console.log(`Rendered ${sources.length} diagrams as SVG and PNG.`);
} finally {
  unlinkSync(browserConfig);
  rmdirSync(temporary);
}

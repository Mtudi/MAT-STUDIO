import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const files = execFileSync("git", ["ls-files", "-z", "--", "*.html"], { encoding: "utf8" })
  .split("\0").filter(Boolean);
const temp = mkdtempSync(join(tmpdir(), "matudi-html-check-"));
let scriptCount = 0;
let failures = 0;

try {
  for (const file of files) {
    const html = await (await import("node:fs/promises")).readFile(file, "utf8");
    const ids = [...html.matchAll(/\\bid\\s*=\\s*(["'])(.*?)\\1/gs)].map((m) => m[2]);
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    if (duplicates.length) {
      failures++;
      process.stderr.write(file + ": duplicate IDs: " + duplicates.join(", ") + "\\n");
    }

    const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
    let index = 0;
    for (const match of scripts) {
      const attrs = match[1] || "";
      const code = match[2] || "";
      const type = (attrs.match(/\\btype=["']([^"']+)["']/i) || [])[1] || "text/javascript";
      if (/\\bsrc\\s*=/.test(attrs) || type === "importmap" || type === "application/ld+json" || !code.trim()) continue;
      const extension = type === "module" ? "mjs" : "cjs";
      const tempFile = join(temp, "inline-" + scriptCount + "-" + index++ + "." + extension);
      writeFileSync(tempFile, code);
      scriptCount++;
      try {
        execFileSync(process.execPath, ["--check", tempFile], { stdio: "pipe" });
      } catch (error) {
        failures++;
        process.stderr.write(file + ": inline script syntax error\\n");
        if (error.stderr) process.stderr.write(String(error.stderr));
      }
    }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

if (failures) {
  process.stderr.write("Static HTML checks failed: " + failures + " issue(s).\\n");
  process.exit(1);
}
process.stdout.write("Static HTML checks passed: " + files.length + " files, " + scriptCount + " inline scripts, no duplicate IDs.\\n");

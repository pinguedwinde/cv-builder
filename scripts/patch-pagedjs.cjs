#!/usr/bin/env node
/**
 * Creates src/vendor/pagedjs.js — a patched copy of pagedjs's browser bundle
 * where String.prototype.contains is replaced by the indexOf-based shim.
 *
 * Run automatically via `postinstall`. Add src/vendor/pagedjs.js to .gitignore.
 */

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../node_modules/pagedjs/dist/paged.js");
const outDir = path.join(__dirname, "../src/vendor");
const out = path.join(outDir, "pagedjs.js");

const content = fs.readFileSync(src, "utf8");

const patched = content.replace(
  /var contains\$1 = isImplemented\$4\(\)\s*\?\s*String\.prototype\.contains\s*:\s*requireShim\$3\(\);/g,
  "var contains$1 = requireShim$3();"
);

if (patched === content) {
  console.warn("[patch-pagedjs] Pattern not found — check if pagedjs was updated");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, patched, "utf8");
console.log("[patch-pagedjs] Written:", path.relative(process.cwd(), out));

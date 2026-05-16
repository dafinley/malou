import { readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { contentSecurityPolicy } from "../src/lib/security-headers.mjs";

const outDir = fileURLToPath(new URL("../out/", import.meta.url));
const cspPattern = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i;

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walk(path);
      continue;
    }

    if (entry.isFile() && path.endsWith(".html")) {
      yield path;
    }
  }
}

// Next emits dynamic image routes (app/opengraph-image.tsx,
// app/twitter-image.tsx) as extensionless files like out/opengraph-image. A
// dynamic Next server serves them with Content-Type: image/png, but
// GitHub Pages serves files based on extension — an extensionless file ends
// up as application/octet-stream, so OG scrapers reject it. Rename to .png and
// patch any HTML references to match.
async function ensurePngExtension(name) {
  const oldPath = join(outDir, name);
  const newPath = join(outDir, `${name}.png`);
  if (!(await exists(oldPath))) return null;
  if (!(await exists(newPath))) {
    await rename(oldPath, newPath);
  }
  return name;
}

const renamed = (
  await Promise.all([ensurePngExtension("opengraph-image"), ensurePngExtension("twitter-image")])
).filter(Boolean);

const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(
  contentSecurityPolicy
)}"/>`;

let pageCount = 0;

for await (const htmlPath of walk(outDir)) {
  const original = await readFile(htmlPath, "utf8");
  let source = original;

  source = source.replace(cspPattern, "");
  source = source.replace("<head>", `<head>${cspMeta}`);

  // Add the .png extension to references of /…/opengraph-image and
  // /…/twitter-image (with optional Next cache-buster query) so they line up
  // with the renamed files above.
  for (const name of renamed) {
    const pattern = new RegExp(`(/${name})(\\?[^"']*)?(?=["'])`, "g");
    source = source.replace(pattern, "$1.png$2");
  }

  if (source !== original) {
    await writeFile(htmlPath, source);
  }

  pageCount += 1;
}

await writeFile(join(outDir, ".nojekyll"), "");

console.log(
  `Prepared ${pageCount} exported HTML files for GitHub Pages${
    renamed.length > 0 ? ` (renamed ${renamed.join(", ")} → *.png)` : ""
  }.`
);

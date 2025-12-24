import { promises as fs } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { generateDocsIndex } from "./generate-docs-index.mjs";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    if (entry.isFile()) {
      const entryPath = path.join(dir, entry.name);
      files.push(entryPath);
    }
  }
  return files;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function extractTitle(markdown, fallbackTitle) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallbackTitle;
}

function renderHtml({ title, content }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 48px 20px; font-family: "Helvetica Neue", Arial, sans-serif; background: #f7f4ef; color: #1f1b16; }
      main { max-width: 920px; margin: 0 auto; background: #fffdf9; padding: 48px; border: 1px solid #e3d8c7; box-shadow: 6px 8px 0 #e3d8c7; }
      h1, h2, h3 { font-weight: 600; margin-top: 2rem; }
      pre { background: #1f1b16; color: #f7f4ef; padding: 16px; overflow: auto; }
      code { font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace; }
      a { color: #8a3b12; }
      img { max-width: 100%; height: auto; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e3d8c7; padding: 8px; }
    </style>
  </head>
  <body>
    <main>
      ${content}
    </main>
  </body>
</html>`;
}

async function buildDocs({ docsDir, outDir }) {
  await generateDocsIndex({ docsDir });
  await ensureDir(outDir);

  const files = await collectFiles(docsDir);
  for (const filePath of files) {
    const relativePath = path.relative(docsDir, filePath);
    const outPath = path.join(outDir, relativePath);
    await ensureDir(path.dirname(outPath));

    if (filePath.toLowerCase().endsWith(".md")) {
      const markdown = await fs.readFile(filePath, "utf8");
      const title = extractTitle(markdown, path.basename(filePath, ".md"));
      const html = renderHtml({ title, content: marked.parse(markdown) });
      const htmlPath = outPath.replace(/\.md$/i, ".html");
      await fs.writeFile(htmlPath, html, "utf8");
      await fs.copyFile(filePath, outPath);
    } else {
      await fs.copyFile(filePath, outPath);
    }
  }
}

const docsDir = path.resolve(requireEnv("DOCS_DIR"));
const outDir = path.resolve(requireEnv("DOCS_OUT_DIR"));

buildDocs({ docsDir, outDir }).catch((error) => {
  console.error(error.message);
  process.exit(1);
});

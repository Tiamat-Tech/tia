import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const entryPath = path.join(dir, entry.name);
      files.push(entryPath);
    }
  }
  return files;
}

export async function generateDocsIndex({ docsDir }) {
  if (!docsDir) {
    throw new Error("DOCS_DIR is required.");
  }

  const indexPath = path.join(docsDir, "index.md");
  const markdownFiles = await collectMarkdownFiles(docsDir);
  const links = markdownFiles
    .map((filePath) => path.relative(docsDir, filePath))
    .filter((relativePath) => relativePath !== "index.md")
    .sort((a, b) => a.localeCompare(b))
    .map((relativePath) => {
      const posixPath = relativePath.split(path.sep).join("/");
      const htmlPath = posixPath.replace(/\.md$/i, ".html");
      return `- [${posixPath}](${htmlPath})`;
    });

  const overview = [
    "# TIA Documentation",
    "",
    "TIA is an XMPP agent framework that implements Lingue protocol flows and",
    "Model Context Protocol (MCP) integrations. It includes long-running agents,",
    "example scripts for message flow testing, and shared utilities for",
    "configuration, logging, and RDF-based profiles.",
    "",
    "## Documents",
    "",
    ...links,
    "",
  ].join("\n");

  await fs.writeFile(indexPath, overview, "utf8");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const docsDir = process.env.DOCS_DIR ? path.resolve(process.env.DOCS_DIR) : "";
  generateDocsIndex({ docsDir }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

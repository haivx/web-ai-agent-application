#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const [, , command = "dev"] = process.argv;

const projectDir = process.cwd();
const appDir = path.join(projectDir, "app");
const pageFile = path.join(appDir, "page.tsx");
const layoutFile = path.join(appDir, "layout.tsx");

function ensureFiles() {
  if (!fs.existsSync(appDir)) {
    console.error("[next-stub] Missing app directory.");
    process.exit(1);
  }

  if (!fs.existsSync(layoutFile)) {
    console.error("[next-stub] Missing app/layout.tsx.");
    process.exit(1);
  }

  if (!fs.existsSync(pageFile)) {
    console.error("[next-stub] Missing app/page.tsx.");
    process.exit(1);
  }
}

function runBuild() {
  ensureFiles();
  const contents = fs.readFileSync(pageFile, "utf8");
  if (!contents.includes("Hello")) {
    console.error("[next-stub] app/page.tsx must render 'Hello'.");
    process.exit(1);
  }

  const outputDir = path.join(projectDir, ".next");
  fs.mkdirSync(outputDir, { recursive: true });
  const artifactPath = path.join(outputDir, "BUILD_LOG.txt");
  const timestamp = new Date().toISOString();
  const message = `Stub Next.js build completed at ${timestamp}`;
  fs.writeFileSync(artifactPath, message + "\n", "utf8");
  console.log(message);
}

function runStart(kind) {
  ensureFiles();
  console.log(`[next-stub] ${kind} server is not implemented in this stub.`);
}

switch (command) {
  case "build":
    runBuild();
    break;
  case "dev":
  case "start":
    runStart(command);
    break;
  case "lint":
    console.log("[next-stub] Lint is not implemented.");
    break;
  default:
    console.error(`[next-stub] Unknown command: ${command}`);
    process.exit(1);
}

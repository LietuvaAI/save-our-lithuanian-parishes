import { execFileSync } from "node:child_process";

const documentationOnly = [
  /(^|\/)docs\//,
  /(^|\/)\.github\//,
  /(^|\/)\.agents\//,
  /(^|\/)\.codex\//,
  /(^|\/)\.claude\//,
  /\.md$/i,
  /(^|\/)LICENSE(?:\.|$)/i,
];

let changedFiles;

try {
  changedFiles = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
} catch {
  // If Vercel's shallow clone cannot resolve the parent, build safely.
  process.exit(1);
}

if (
  changedFiles.length > 0 &&
  changedFiles.every((file) => documentationOnly.some((pattern) => pattern.test(file)))
) {
  console.log("Skipping Vercel build: documentation and repository metadata only.");
  process.exit(0);
}

console.log("Running Vercel build: deployable files changed.");
process.exit(1);

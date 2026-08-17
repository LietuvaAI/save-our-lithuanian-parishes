import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const documentationOnly = [
  /(^|\/)docs\//,
  /(^|\/)\.github\//,
  /(^|\/)\.agents\//,
  /(^|\/)\.codex\//,
  /(^|\/)\.claude\//,
  /\.md$/i,
  /(^|\/)LICENSE(?:\.|$)/i,
];

export function buildDecision({ branch, changedFiles }) {
  if (!branch) {
    return { skip: false, reason: "Git branch unavailable; building safely." };
  }

  if (branch !== "main") {
    return { skip: true, reason: `Preview builds are disabled for branch ${branch}.` };
  }

  if (
    changedFiles.length > 0 &&
    changedFiles.every((file) => documentationOnly.some((pattern) => pattern.test(file)))
  ) {
    return { skip: true, reason: "Documentation and repository metadata only." };
  }

  return { skip: false, reason: "Deployable files changed on main." };
}

function changedFilesForHead() {
  return execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

function run() {
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  let changedFiles = [];

  if (branch === "main") {
    try {
      changedFiles = changedFilesForHead();
    } catch {
      console.log("Running Vercel build: parent commit unavailable.");
      process.exit(1);
    }
  }

  const decision = buildDecision({ branch, changedFiles });
  console.log(`${decision.skip ? "Skipping" : "Running"} Vercel build: ${decision.reason}`);
  process.exit(decision.skip ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}

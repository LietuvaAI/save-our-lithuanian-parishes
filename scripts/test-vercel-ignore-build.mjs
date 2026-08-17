import assert from "node:assert/strict";

import { buildDecision } from "./vercel-ignore-build.mjs";

assert.equal(
  buildDecision({ branch: "agent/profile-update", changedFiles: ["app/page.tsx"] }).skip,
  true,
  "feature branches must not consume preview builds",
);

assert.equal(
  buildDecision({ branch: "main", changedFiles: ["docs/INFRASTRUCTURE.md", "README.md"] }).skip,
  true,
  "documentation-only main commits should not deploy",
);

assert.equal(
  buildDecision({ branch: "main", changedFiles: ["data/parishes.json"] }).skip,
  false,
  "public data changes on main must deploy",
);

assert.equal(
  buildDecision({ branch: undefined, changedFiles: [] }).skip,
  false,
  "missing Vercel branch context must fail safe by building",
);

console.log("Vercel ignore-build policy tests passed.");

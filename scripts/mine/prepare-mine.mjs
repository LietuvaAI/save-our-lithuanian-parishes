// prepare-mine.mjs — stage a work-list in-repo and generate a runnable mine workflow.
//
//   node scripts/mine/prepare-mine.mjs <work-list.json> <out-script.js> [--batch=120] [--name=my-mine]
//
// work-list.json: [{ id, path }, ...]  — id = stable key (parish/filename/record),
//                 path = ABSOLUTE path each agent will Read.
// The work-list is copied into .mine-tmp/ (gitignored, in-repo so subagents can read it),
// and <out-script.js> is written from mine-workflow.template.js with ITEMS/BATCH inlined.
// Then edit the two TODO blocks in <out-script.js> and run it with the Workflow tool.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const [listArg, outArg, ...rest] = process.argv.slice(2);
if (!listArg || !outArg) {
  console.error("usage: node scripts/mine/prepare-mine.mjs <work-list.json> <out-script.js> [--batch=N] [--name=slug]");
  process.exit(1);
}
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const batch = Number(opt.batch) || 120;
const name = opt.name || "bulk-mine";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const items = JSON.parse(readFileSync(listArg, "utf8"));
if (!Array.isArray(items) || !items.every((x) => x && x.id != null && x.path)) {
  throw new Error("work-list must be an array of { id, path }");
}
if (batch > 120) console.warn(`WARN: batch ${batch} > 120 — a batch's return may truncate (rule 4). Consider a smaller batch.`);

// stage the work-list in-repo (rule 3: subagents can't read /private/tmp)
mkdirSync(join(repoRoot, ".mine-tmp"), { recursive: true });
writeFileSync(join(repoRoot, ".mine-tmp", `${name}-worklist.json`), JSON.stringify(items, null, 0) + "\n");

// generate the runnable script from the template
const tmpl = readFileSync(join(here, "mine-workflow.template.js"), "utf8");
const script = tmpl
  .replace("__ITEMS__", JSON.stringify(items))
  .replace("__BATCH__", String(batch))
  .replace("__MINE_NAME__", name)
  .replace("__MINE_DESCRIPTION__", `Bulk structured extraction over ${items.length} items (${name})`);
writeFileSync(resolve(outArg), script);

console.log(`OK: ${items.length} items, batch ${batch}.`);
console.log(`  staged work-list -> .mine-tmp/${name}-worklist.json`);
console.log(`  generated script -> ${outArg}`);
console.log(`Next: edit the two TODO blocks (ROW schema + PROMPT) in ${outArg}, then run it with the Workflow tool.`);

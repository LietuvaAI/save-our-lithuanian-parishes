# Bulk-extraction mine toolkit

Reusable scaffold for **"read N documents, extract one structured row each"** jobs
(institutional PDFs, workbooks, scanned pages, records). Encodes the pattern that
*worked* on the 2026-07-20 AOD 209-workbook mine — after two thrown-away runs taught
the lessons. Start here; don't rebuild from scratch.

Full rationale: memory `workflow-mine-operational-lessons`; routing canon
`culturenet-brain/docs/systems/model-tier-routing-2026-07.md`.

## The four rules this toolkit enforces (why earlier runs were wasted)

1. **Cheap tier from run 1.** Extraction is mechanical → Haiku. Use `agentType: 'ops'`
   (`.claude/agents/ops.md`, Haiku-pinned; has Read/Bash/Grep). Never `general-purpose`.
   *(Run 1 of the AOD mine ran on Opus — ~15× the cost — because of the default agent.)*
2. **Pin identity in code, never trust the model to echo it.** Inject the row's key
   (`{id: item.id, ...agentResult}`) in the workflow, not in the agent's free text.
   *(Run 2 let agents write parish names; 11 collided; the whole run was unusable for a
   public table and thrown away.)*
3. **Stage inputs INSIDE the repo tree.** Workflow subagents are sandboxed to the
   checkout and cannot read the session scratchpad (`/private/tmp/...`). Put the work-list
   and any files agents must read in a gitignored in-repo dir (e.g. `.mine-tmp/`).
4. **Returns truncate — plan for it.** A ~200-row return overflows both the notification
   and the `.output` file. So: run in **batches small enough that each batch's return is
   complete** (≤ ~120 rows), and make the assembly read the batch returns, not one giant
   one. The journal is complete but unordered and only carries what the agent literally
   output — hence rule 2.

## Files

- `prepare-mine.mjs` — takes your work-list, stages it in `.mine-tmp/`, and **generates a
  runnable workflow script** with the items inlined (inlining beats `args`, which has
  dropped values). You edit two marked blocks in the generated script (the schema and the
  per-item prompt), then run it with the Workflow tool.
- `mine-workflow.template.js` — the template `prepare-mine.mjs` fills in. Batched,
  identity-pinned, `ops`-routed, tail-safe. Not run directly.

## Run sequence

```
# 1. Build your work-list: [{ id, path }] — id = the stable key (parish, filename…),
#    path = an ABSOLUTE path the agents can read (stage under .mine-tmp/ first).
# 2. Generate the mine script:
node scripts/mine/prepare-mine.mjs <work-list.json> <out-script.js>
# 3. Edit the two TODO blocks in <out-script.js>: the row SCHEMA and the per-item PROMPT.
# 4. Run it via the Workflow tool (scriptPath: <out-script.js>). It batches automatically.
# 5. Assemble from the batch returns; QC against any known-good subset before publishing.
```

Deterministic work (fetching, text extraction, CSV assembly, QC math) stays in plain
Node/bash — agents are only for the per-document judgment. Cheaper, faster, verifiable.

# Dispatches archive

The copy-of-record for every post published on the blog
(blog.saveourlithuanianparishes.org — the campaign's Substack). Substack is
the **publishing surface**; this folder is the **archive**. If Substack ever
vanished, changed terms, or held the content hostage, nothing would be lost.

One markdown file per post, named `YYYY-MM-DD-<substack-slug>.md`, with
frontmatter carrying the title, subtitle, publication date, canonical
Substack URL, and the date it was archived here.

## Syncing

After publishing on Substack:

```sh
node scripts/import-dispatches.mjs
```

Idempotent — already-archived posts are skipped. To re-import everything
(e.g. after editing a published post on Substack), pass `--force`.

## Where things live (the parapija content map)

| Content | Home |
|---|---|
| Research corpus, canonical dataset, mine outputs | `culturenet-brain` (private) |
| Published data snapshots, case records, candidates | this repo, `data/` |
| The website | this repo, `app/` |
| Blog posts (dispatches) | **published on Substack, archived here** |
| Canonical authored prose (the article) | `writing` repo |

Research flows into this repo by snapshot PR only — see `CLAUDE.md` for the
data discipline that keeps the site's figures verifiable.

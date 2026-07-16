# Infrastructure — SaveOurLithuanianParishes.org

How the domain, DNS, hosting, and blog are wired together, and where to go to change each piece.
Last verified: **2026-07-16**.

There are no secrets in this setup — the site is fully static, has no backend, and uses no `.env`
files (see `CLAUDE.md`). This document is the "environments file" for the project.

## The big picture

```
saveourlithuanianparishes.org        (domain, registered at Porkbun)
  │
  ├─ nameservers: ns1/ns2.vercel-dns.com   → DNS is managed at VERCEL, not Porkbun
  │
  ├─ apex  → Vercel project "save-our-lithuanian-parishes"   (this repo, the website)
  └─ blog  → CNAME target.substack-custom-domains.com        (Substack, the Dispatches)
```

Porkbun is **only the registrar** (where the domain is renewed). Everything else — DNS records,
SSL certificates, and web hosting — lives at Vercel. Substack serves the blog subdomain.

## Domain registration

| | |
|---|---|
| Domain | `saveourlithuanianparishes.org` |
| Registrar | [Porkbun](https://porkbun.com) — account `vboguta` |
| Registered | 2026-07-15 |
| Expires | **2028-07-09** — renew at Porkbun |
| Nameservers | `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (set 2026-07-16) |

The only things ever done at Porkbun: renew the domain, or change the nameservers
(Domain Management → `NS` chip on the domain row → Edit Authoritative Nameservers).
**Do not** manage DNS records at Porkbun — its zone is not authoritative for this domain
(and see the history section below for why).

## DNS

DNS is hosted by **Vercel** (nameservers above). Edit records at:
**vercel.com → team `lietuvaais-projects` → Domains → saveourlithuanianparishes.org**
(direct link: `https://vercel.com/lietuvaais-projects/~/domains/saveourlithuanianparishes.org`).

Records as of 2026-07-16:

| Name | Type | Value | Purpose |
|---|---|---|---|
| `@` (apex) | — | managed by Vercel | Serves the website (project below). Vercel answers the apex with its anycast IPs (`216.150.1.x`) automatically because the domain is attached to the project — there is no hand-written A record to maintain. |
| `blog` | CNAME | `target.substack-custom-domains.com.` | Substack custom domain for the Dispatches. TTL 60. |
| `@` | CAA | (system) | Added by Vercel so it can issue SSL certificates. Leave alone. |

SSL: issued and renewed **automatically by Vercel** for the apex, and by Substack for `blog`.
No action ever needed.

⚠️ Note on email: while nameservers point at Vercel, Porkbun's free email forwarding for this
domain will **not** work. If `@saveourlithuanianparishes.org` email is ever wanted, add MX
records in the Vercel DNS panel (e.g. for a forwarding service) — don't set it up at Porkbun.

## Website hosting

| | |
|---|---|
| Host | Vercel, team **`lietuvaais-projects`** |
| Project | **`save-our-lithuanian-parishes`** |
| Source | GitHub `LietuvaAI/save-our-lithuanian-parishes` (Git integration) |
| Production | merge to `main` → auto-deploys to `saveourlithuanianparishes.org` |
| Previews | every branch push → unique preview URL, linked on the PR |
| Canonical host | apex (`saveourlithuanianparishes.org`); no `www` configured |
| Fallback URL | `save-our-lithuanian-parishes.vercel.app` (always works, independent of DNS) |

The site is fully static (Next.js SSG). `npm run data` (runs as `prebuild`) re-derives all figures
from `data/parishes.csv` and **fails the build** if they drift from the locked figure set —
a broken data change can never silently deploy.

## Blog (Dispatches)

| | |
|---|---|
| Publication | Save Our Lithuanian Parishes on Substack |
| Substack URL | `saveourlithuanianparishes.substack.com` |
| Custom domain | **`blog.saveourlithuanianparishes.org`** |
| DNS side | the `blog` CNAME in Vercel DNS (table above) |
| Substack side | Settings → Domain, custom domain configured there |

Site links should point at `blog.saveourlithuanianparishes.org` (the branded domain), not the
`.substack.com` address.

## Why DNS is at Vercel and not Porkbun (history, 2026-07-15/16)

So nobody ever "fixes" this back:

1. The domain was registered 2026-07-15 and provisioned onto an **old** set of Porkbun default
   nameservers, so early record edits were written into a zone nothing was serving.
2. After correcting that, records still wouldn't stick — Porkbun's editor **stages** records on
   "Add Record" and only commits on "Submit Records", which is easy to miss.
3. Even after a confirmed, committed zone, the apex kept serving Porkbun's **parking page**
   (`pixie.porkbun.com`, IPs `207.207.210.107` / `207.207.210.229`). Empirically proven: the
   parking ALIAS survived adding an A record, displacing the ALIAS, and a **full wipe-and-replace
   of the zone** — it is synthesized at Porkbun's server level and only their support can clear it.
4. Rather than wait on support, DNS hosting was delegated to Vercel's nameservers (2026-07-16),
   which bypasses Porkbun's zone entirely. The `blog` CNAME was created in Vercel DNS **before**
   the nameserver switch, so the blog never went down.

Same pattern as our other properties — the registrar and the DNS host don't have to be the
same company:

| Domain | Registrar | DNS host | Site host |
|---|---|---|---|
| `saveourlithuanianparishes.org` | Porkbun | **Vercel** | Vercel |
| `ziburioltmokykla.org` (archyvas) | — | SiteGround | Vercel |
| `lietuva.ai` | Porkbun | Porkbun | — |

## Runbooks

**Add or change a DNS record** → Vercel team Domains page (link above) → the domain → add the
record. Takes effect in ~60s. Never at Porkbun.

**Renew the domain** → Porkbun, account `vboguta`, before 2028-07-09.

**Deploy the site** → open a PR; merged `main` deploys itself. Nothing manual.

**Check what's actually live** →
```sh
whois saveourlithuanianparishes.org | grep -i "name server"   # registry truth
dig +short A saveourlithuanianparishes.org                    # should be 216.150.1.x (Vercel)
dig +short CNAME blog.saveourlithuanianparishes.org           # Substack target
curl -sI https://saveourlithuanianparishes.org | head -1      # HTTP 200
```

**If the domain ever shows a parking page again** → check the nameservers first (`whois`); if
they've reverted to `*.ns.porkbun.com`, re-set them to `ns1`/`ns2.vercel-dns.com` at Porkbun and
**re-verify with whois after saving** — a Porkbun nameserver save has silently failed on us once.

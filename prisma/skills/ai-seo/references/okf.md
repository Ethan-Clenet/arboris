# Open Knowledge Format (OKF)

Google-backed markdown bundle format (v0.1 era) for agent-readable site knowledge: a directory of cross-linked files with YAML frontmatter, readable without scraping.

**Status:** Protocol-layer registration (similar to early schema.org). No confirmed AI-search ranking boost as of mid-2026. Useful for agents and data catalogs; optional for classic SEO.

## When to use

- You want a stable, crawl-light knowledge pack for agents.
- Your site has structured product/docs/catalog facts worth exposing as markdown.
- You’re experimenting with agent commerce / knowledge sharing.

## When to skip

- Tiny brochure sites with little structured knowledge.
- You already ship strong `llms.txt` + public pricing/docs and have no agent use case.
- You cannot keep the bundle in sync with the live site (stale OKF is worse than none).

## Implementation paths

1. **By hand** — Create `/okf/` (or agreed path) with index + topic files, YAML frontmatter (`title`, `id`, `related`, dates).
2. **Generator** — Prefer a free/community generator if available for your stack; regenerate on deploy.
3. **CMS plugin** — e.g. WordPress plugin routes if your site is WP-based.

## Hosting guidance

- Serve as static files from the site origin (same domain as content).
- Link from `llms.txt` and sitemap if present.
- Version or date-stamp files; update when product facts change.
- Keep content public and HTML-indexable equivalents elsewhere for Google.

## Minimal shape (illustrative)

```text
/okf/
  index.md          # catalog of entries
  product.md        # what you sell, who for
  pricing.md        # tiers / limits (or point to /pricing.md)
  faq.md
```

Each file: YAML frontmatter + markdown body; cross-link with relative paths.

## Relation to other files

| File | Role |
|------|------|
| `robots.txt` | Crawler allow/deny |
| `llms.txt` | Short AI context map of the site |
| `/pricing.md` | Agent-readable pricing |
| `/okf/` | Richer cross-linked knowledge bundle |

Treat OKF as additive. It does not replace people-first pages or E-E-A-T.

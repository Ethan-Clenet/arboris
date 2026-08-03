# Platform Ranking Factors (AI SEO)

How major AI answer engines select and cite sources — and what to optimize per platform.

## Google AI Overviews / AI Mode

- Strongly tied to **core Search ranking** and quality systems (E-E-A-T).
- No special AI markup or files required.
- Optimize for people: clear headings, original info, indexability, semantic HTML.
- Query fan-out: cover topical clusters, not single keywords.

## ChatGPT (with search)

- Broader source set than page-1 Google only.
- Rewards extractable passages, FAQs, tables, definitions.
- Respects `GPTBot` / `ChatGPT-User` in robots.txt — blocking prevents citation.
- Third-party sources (Wikipedia, Reddit, reviews) often outrank brand sites.

## Perplexity

- Always cites with links; favors authoritative, **recent**, well-structured pages.
- Statistics with sources and clear answer blocks perform well.
- Allow `PerplexityBot`.

## Gemini

- Google index + Knowledge Graph.
- `Google-Extended` controls Gemini / some AI training use — decide consciously.
- Entity clarity (Organization schema, consistent NAP) helps.

## Copilot

- Bing index + authoritative sources.
- Allow `Bingbot`; keep Bing Webmaster aligned with Google fundamentals.

## Claude (with Brave Search when enabled)

- Training data + Brave results when search is on.
- Allow `ClaudeBot` / `anthropic-ai` if you want citation via Anthropic products.

## robots.txt — citation vs training

Allow search/cite bots if you want AI citations:

```txt
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

# Optional: block training-only crawlers while keeping cite bots
User-agent: CCBot
Disallow: /
```

Blocking a cite bot means that platform **cannot** cite you. Blocking `CCBot` only affects Common Crawl training corpora.

## Cross-platform checklist

1. People-first content + E-E-A-T (Google).
2. Extractable structure: 40–60 word answers, FAQs, tables (ChatGPT / Perplexity / Claude).
3. Freshness dates and cited statistics.
4. Schema where it helps classic SEO (`Article`, `FAQPage`, `HowTo`, `Product`, `Organization`).
5. Third-party presence (Wikipedia, Reddit, review sites, YouTube).
6. Machine-readable extras (`llms.txt`, `/pricing.md`) for non-Google agents — optional for Google.

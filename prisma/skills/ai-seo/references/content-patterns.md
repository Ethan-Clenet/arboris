# Content Patterns for AI Extractability

Templates for passages AI systems can lift as standalone citations. Write for humans; structure for clarity.

## Definition block (“What is X?”)

Lead with a 40–60 word direct answer, then expand.

```markdown
## What is [Term]?

[Term] is [one-sentence definition]. It [what it does / who it’s for] by [mechanism].
Teams use it when [primary use case], typically instead of [alternative].

### Why it matters
...
```

## Step-by-step (“How to X”)

```markdown
## How to [Outcome]

1. **[Step name]** — [one clear action]. [Optional detail].
2. **[Step name]** — ...
3. **[Step name]** — ...

### Common mistakes
- ...
```

Prefer numbered lists over long paragraphs. Pair with `HowTo` schema when appropriate.

## Comparison table (“X vs Y”)

```markdown
## [X] vs [Y]

| Dimension | X | Y |
|-----------|---|---|
| Best for | ... | ... |
| Pricing | ... | ... |
| Setup time | ... | ... |
| Limitations | ... | ... |

**Choose X if** ...  
**Choose Y if** ...
```

## Pros / cons

```markdown
## Pros and cons of [Thing]

**Pros**
- ...

**Cons**
- ...
```

## FAQ block

Use natural-language questions that match how people (and AI fan-out) ask.

```markdown
## FAQ

### Does [product] support [capability]?
[40–60 word self-contained answer.]

### How much does [product] cost?
[Direct answer + link to /pricing.md or pricing page.]
```

Add `FAQPage` schema.

## Statistic block

```markdown
According to [Source] ([Year]), [specific number with unit].
[One sentence on methodology or sample if available.]
```

Always date stats and link the original source when possible.

## Structural rules (quick)

- Answer first, context second.
- One idea per paragraph.
- H2/H3 phrased like real queries.
- Tables for comparisons; lists for processes.
- Self-contained snippets (no “as mentioned above” as the only glue).

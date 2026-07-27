---
name: lighthouse
description: Audit perf Lighthouse / Core Web Vitals sur une page après changement lourd.
---

# Performance page (Lighthouse)

1. Identifie l’URL / route impactée (dev, `preview`, ou staging).
2. Build prod locale si pertinent (`npm run build` + `preview` / équivalent).
3. Mesure (Lighthouse CLI, DevTools, ou outil déjà dans le repo) : **LCP, CLS, INP/TBT**, poids JS.
4. Si régression : propositions concrètes (lazy-load, images, split, cache, moins de JS critique) — **une** priorité à la fois.
5. Compte-rendu avant/après si une 2ᵉ mesure est possible.

Ne pas inventer des scores : cite la source de mesure.

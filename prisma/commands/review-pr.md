---
name: review-pr
description: Lance une revue de pull request structurée (risques, tests, clarté).
---

# Review PR

Tu es un reviewer senior. Analyse le diff / la PR en cours et produis :

1. **Résumé** — 2–3 phrases sur l’intention du changement
2. **Risques** — bugs, régressions, sécurité, perf (par sévérité)
3. **Tests manquants** — cas à couvrir avant merge
4. **Suggestions** — améliorations concrètes (API, naming, structure)
5. **Verdict** — Approve / Request changes / Needs discussion

Reste factuel, cite les fichiers et lignes quand c’est utile. N’invente pas de code absent du diff.

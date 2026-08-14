---
name: cve
description: Scan CVE (OSV / NVD) des dépendances à partir de package.json et autres lockfiles.
skills:
  - cve-scan
  - security-review
---

# /cve — Scan CVE des dépendances

Tu cherches des **failles connues (CVE / GHSA)** dans les dépendances du workspace, via les API publiques — pas seulement `npm audit`.

Charge et suis le skill **`cve-scan`** (procédure OSV / NVD). Appuie-toi sur **`security-review`** pour le volet hygiène deps (lockfile, audit natif) une fois les findings triés.

## Skills compagnons (installés avec `/cve`)

| Skill | Rôle |
|-------|------|
| `cve-scan` | Inventaire manifests → API OSV (`/v1/query`, `/v1/querybatch`, `/v1/vulns/{id}`) + enrichissement NVD |
| `security-review` | Checklist sécu (dont *Dependency Security* : `npm audit`, lockfiles) |

## Déroulé

1. **Inventaire** — `package.json` (racine + workspaces) et tout autre manifest / lockfile (`pnpm-lock.yaml`, `yarn.lock`, `requirements.txt`, `go.mod`, `Cargo.lock`, `pom.xml`, `composer.lock`, …). Ignore `node_modules` / `vendor` / `dist`.
2. **Versions résolues** — lockfile en priorité. Sans lockfile : deps directes seulement, et le dire.
3. **OSV (obligatoire)** — `POST https://api.osv.dev/v1/querybatch` par lots ≤ 1000, puis `GET https://api.osv.dev/v1/vulns/{id}` pour les hits. Ne pas inventer d’identifiants.
4. **Compléments** — `npm audit` (ou audit du gestionnaire) ; NVD uniquement pour préciser un CVE HIGH/CRITICAL.
5. **Compte-rendu** — tableau package → version → CVE/GHSA → sévérité → fix connu → action. CRITICAL/HIGH d’abord.
6. **Fix** — ne modifie pas les manifests sauf demande. Pour un plan de bump npm : `/audit-deps` (sécu) ou `/ncu` (versions). Pour le **diff de code** : `/security-diff`.

## Règles

- Réponds dans la langue de l’utilisateur.
- Aucun manifest → explique et stoppe.
- API en erreur → coller le message, fallback audit natif, le dire.
- Ne pas scanner la config agent (`.claude/`) : ça c’est `security-scan`, hors sujet.

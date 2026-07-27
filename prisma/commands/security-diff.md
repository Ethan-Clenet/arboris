---
name: security-diff
description: Audit sécu rapide sur le diff — auth, routes, uploads, secrets, CORS.
---

# Audit sécurité (diff)

Sur les fichiers **modifiés** du lot :

1. Lister chemins touchés (auth, routes/API, middleware, upload, cookies, CORS, HTML dangereux).
2. Vérifier :
   - authz / IDOR (accès objet sans contrôle)
   - validation des entrées
   - pas de secret hardcodé ni `.env` commité
   - logs sans PII / tokens
   - uploads : type, taille, chemin
3. Croiser avec docs sécu du repo si présentes (`SECURITY.md`, matrices, etc.).
4. Compte-rendu : findings par sévérité + correctifs proposés (minima).

Ne pas scanner tout le monorepo sauf demande — reste sur le **diff**.

---
name: owners-review
description: Identifie qui / quelles expertises doivent revoir quels chemins d’une grosse PR.
---

# Revue par zones (code owners)

Pour une PR transverse :

1. Lister les chemins du diff, groupés par zone (API, UI, auth, data, infra, docs…).
2. Lire `CODEOWNERS` / `OWNERS` / docs d’équipe s’ils existent.
3. Proposer une matrice : **zone → reviewer / expertise** (sécu, UX, data, infra).
4. Hotspots (auth, paiements, migrations, perms) → revue obligatoire même sans CODEOWNERS.

Sortie : tableau court prêt à coller dans la PR.

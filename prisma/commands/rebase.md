---
name: rebase
description: Rebase intelligent — intègre la branche de base et résout les conflits proprement.
---

# Rebase intelligent

Tu rebases la branche courante sur sa base (souvent `main` / `master` / la tracked upstream) et tu résous les conflits de façon sûre, explicable et minimale.

## Avant tout

1. **État** — `git status`, `git branch -vv`, `git log --oneline --graph -15`.
2. **Base** — déduis la branche cible :
   - upstream de la branche courante si claire ;
   - sinon `main`, puis `master` ;
   - sinon demande / utilise celle indiquée par l’utilisateur.
3. **Sécurité** — refuse de continuer si :
   - working tree sale (changes non commités) sans stash explicite demandé ;
   - rebase / merge / cherry-pick déjà en cours (termine ou abort d’abord) ;
   - l’utilisateur n’a pas demandé un force-push (ne force jamais sans demande explicite).

## Procédure

1. **Mettre à jour la base**
   ```bash
   git fetch origin
   ```
2. **Rebase**
   ```bash
   git rebase origin/<base>
   ```
   (adapte `origin/<base>` au remote/branche réels).
3. **Conflits** — pour chaque conflit :
   - lis les deux côtés et le contexte du fichier ;
   - conserve l’intention des **deux** changements quand c’est possible ;
   - préfère la version de la base pour le code mort / généré / lockfiles conflictuels **sauf** si la branche apporte une maj volontaire ;
   - pour `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` : résous via le gestionnaire (`npm install`, `pnpm install`, …) plutôt qu’à la main ;
   - n’introduis pas de marqueurs `<<<<<<<` restants ;
   - après résolution : `git add <files>` puis `git rebase --continue`.
4. **Boucle** — répète jusqu’à fin du rebase. Si blocage : `git rebase --abort`, explique, propose un plan alternatif (rebase interactif ciblé, merge, cherry-pick).
5. **Vérifs** — lance les checks déjà présents (`typecheck`, `test`, `lint`, `build`) si pertinents après un rebase non trivial.
6. **Compte-rendu**
   - base utilisée et commits rejoués
   - fichiers en conflit et choix faits (pourquoi)
   - résultat des vérifs
   - prochaines étapes : `git push` normal, ou `git push --force-with-lease` **seulement** si l’utilisateur le demande explicitement

## Règles

- Jamais `git rebase -i` (interactif non supporté ici) : utilise un rebase linéaire classique.
- Jamais `--force` / `--no-verify` / amend d’un commit déjà poussé sans demande explicite.
- Préfère `--force-with-lease` à `--force` si un republish est demandé.
- Ne réécris pas l’historique partagé (main/master) sauf demande explicite.
- Si un conflit est ambigu (logique métier), pose une question courte plutôt que de deviner.

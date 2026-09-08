---
name: capec-code-audit
description: Audite du code source pour y détecter des vulnérabilités en les mappant à la taxonomie MITRE CAPEC (Common Attack Pattern Enumeration and Classification), avec sévérité (label + score CVSS estimé) et référence CWE. Utilise ce skill dès que l'utilisateur demande un audit de sécurité, une revue de vulnérabilités, une analyse de code pour détecter des failles/attaques possibles, un pentest statique, ou mentionne CAPEC/CWE/OWASP sur du code qu'il fournit ou qui est dans le repo. Déclenche-toi même si l'utilisateur ne cite pas explicitement "CAPEC" — toute demande du type "audite ce code", "trouve les failles de sécurité", "est-ce que ce fichier est vulnérable" sur du code source doit utiliser ce skill.
metadata:
  origin: Arboris
---

# Audit de code source via la taxonomie CAPEC

Ce skill structure une revue de sécurité de code source en s'appuyant sur la
classification officielle MITRE CAPEC-1000 (Mechanisms of Attack). Il ne remplace
pas un pentest dynamique ni un SAST outillé (Semgrep, CodeQL...) — c'est une revue
manuelle guidée par une taxonomie reconnue, pour un rapport structuré et traçable.

## Portée

Ce skill couvre les mécanismes CAPEC **détectables par lecture de code source** :

- CAPEC-152 — Inject Unexpected Items (injections : SQLi, XSS, command injection, SSTI, XXE, désérialisation...)
- CAPEC-255 — Manipulate Data Structures (buffer overflow, path traversal, LFI/RFI)
- CAPEC-225 — Subvert Access Control (auth, autorisation, IDOR, CSRF, gestion de session)
- CAPEC-172 — Manipulate Timing and State (race conditions, TOCTOU)
- CAPEC-210 — Abuse Existing Functionality (SSRF, mass assignment, header injection, DoS applicatif)
- CAPEC-223 — Employ Probabilistic Techniques (brute-force, crypto faible, RNG prévisible)
- Volets applicatifs de CAPEC-118, CAPEC-262 (fuite d'info, secrets en dur, config exposée)

Sont explicitement **hors périmètre** (non détectables en lisant du code) : recon réseau
actif (scan de ports, fingerprinting OS), ingénierie sociale, attaques physiques/side-channel
matérielles (électromagnétique, timing d'écran). Si l'utilisateur demande explicitement
ces angles, le dire clairement plutôt que d'inventer des findings.

## Référentiel

Le mapping complet CAPEC → CWE → indices de détection est dans `references/` :

- `references/01-injection.md` — CAPEC-152 et sous-patterns
- `references/02-manipulate-data-structures.md` — CAPEC-255
- `references/03-subvert-access-control.md` — CAPEC-225
- `references/04-timing-state-abuse.md` — CAPEC-172 et CAPEC-210
- `references/05-probabilistic-crypto-misc.md` — CAPEC-223 + volets code de CAPEC-118/262

**Toujours charger les fichiers de référence pertinents avant de commencer l'audit**
(pas besoin de tous les charger si le code est clairement d'un seul type, ex: pas de
buffer overflow à chercher dans du JS/TS pur — dans ce cas `02-manipulate-data-structures.md`
peut être ignoré sauf pour la partie path traversal).

## Méthodologie d'audit

### 1. Cadrage rapide

Avant de lire le code ligne par ligne, identifier :
- Langage(s) et frameworks (ça élimine des familles CAPEC non pertinentes — pas de buffer
  overflow classique en JS géré, pas de LDAP injection s'il n'y a pas de LDAP)
- Surface exposée : ce fichier/module reçoit-il de l'input utilisateur direct (route HTTP,
  paramètre CLI, parsing de fichier uploadé) ou est-il interne/de confiance ?
- Présence de secrets, DB, auth, upload, appels sortants (SSRF), sérialisation

### 2. Lecture systématique par famille

Parcourir le code en cherchant, dans l'ordre de fréquence réelle en revue de code web/backend :

1. **Entrées non fiables → sinks dangereux** (CAPEC-152) : tracer chaque source d'input
   (query params, body, headers, cookies, fichiers uploadés, variables d'env) jusqu'à son
   utilisation. Un sink dangereux sans validation/échappement adapté = finding.
2. **Contrôle d'accès** (CAPEC-225) : chaque route/endpoint a-t-il un contrôle d'autorisation
   cohérent avec ce qu'il expose ? Vérifier particulièrement les endpoints CRUD (souvent
   seul le GET est protégé, DELETE/PUT oublié) et l'IDOR (l'ID de ressource est-il vérifié
   comme appartenant à l'utilisateur courant ?).
3. **Gestion des secrets et de la crypto** (CAPEC-223, volet CAPEC-118) : recherche de
   patterns `password`, `secret`, `key`, `token` en dur ; algorithmes de hash faibles ;
   RNG non cryptographique pour des tokens de sécurité.
4. **Race conditions et état** (CAPEC-172) : opérations check-then-act sur ressources
   partagées sans transaction/verrou (soldes, quotas, création de ressource unique).
5. **Abus de fonctionnalité** (CAPEC-210) : tout endpoint qui fait une requête sortante
   avec une URL/hôte contrôlé par l'utilisateur (SSRF) ; tout binding direct
   body→modèle sans DTO/whitelist (mass assignment).
6. **Fuite d'information** (volet CAPEC-118) : messages d'erreur verbeux, stack traces
   exposées, endpoints de debug, fichiers sensibles servis statiquement.

Pour chaque famille, consulter le tableau correspondant dans `references/` pour l'ID CAPEC
exact et les indices de détection.

### 3. Qualification de chaque finding

Ne pas remonter un soupçon vague. Pour chaque vulnérabilité identifiée, vérifier :
- **Exploitabilité réelle** : la donnée arrive-t-elle vraiment d'une source non fiable
  jusqu'au sink, sans validation/sanitation en chemin ? Si une validation existe mais
  semble insuffisante, le dire précisément plutôt que de classer comme faux positif ou
  comme critique par défaut.
- **Contexte** : un `eval()` sur une chaîne 100% statique n'est pas une injection ; un
  `eval()` sur un fragment dérivé d'input utilisateur l'est.
- Si le doute est réel après lecture attentive, classer en sévérité **Faible/Info** avec
  la mention explicite du doute, plutôt que d'arrondir vers le haut ou le bas.

### 4. Sévérité

Chaque finding reçoit deux éléments de sévérité :
- **Label** : Critique / Haute / Moyenne / Faible / Info
- **Score CVSS estimé** : une estimation raisonnée (pas un calcul CVSS formel avec vecteur
  complet, sauf si l'utilisateur le demande) basée sur les valeurs indicatives des tableaux
  de référence, ajustée au contexte réel du code (une injection SQL sur un endpoint public
  non authentifié est plus grave que la même faille derrière une authentification admin
  stricte — le score de référence est un point de départ, pas une valeur figée).

Barème des labels :
- **Critique** (9.0–10.0) : exécution de code arbitraire, prise de contrôle totale, accès
  non authentifié à des données sensibles à grande échelle
- **Haute** (7.0–8.9) : contournement d'authentification/autorisation, accès à des données
  d'autres utilisateurs, injection avec impact limité
- **Moyenne** (4.0–6.9) : fuite d'information limitée, DoS applicatif, faiblesse nécessitant
  des conditions préalables significatives
- **Faible** (0.1–3.9) : durcissement recommandé, pas d'exploitation directe évidente
- **Info** : bonne pratique manquante sans impact de sécurité direct démontrable

### 5. Format du rapport

Produire une liste de findings, un par vulnérabilité, dans cet ordre (du plus grave au
moins grave). Pour chaque finding :

```
### [SÉVÉRITÉ] Titre court de la vulnérabilité
- **CAPEC** : CAPEC-XX — Nom officiel
- **CWE** : CWE-XX — Nom
- **CVSS estimé** : X.X (label)
- **Localisation** : fichier:ligne (ou plage de lignes)
- **Description** : ce qui se passe concrètement dans ce code, en une à trois phrases
- **Scénario d'exploitation** : comment un attaquant utiliserait ce point précis
- **Remédiation** : correction concrète et actionnable (pas juste "valider l'input" —
  dire quoi/comment : requête préparée, échappement spécifique, librairie recommandée)
```

Terminer par un court résumé : nombre de findings par sévérité, et les 1-3 priorités
à corriger en premier si le temps est limité.

Ne pas produire de findings dupliqués si la même cause racine touche plusieurs lignes
similaires (ex: 10 requêtes SQL concaténées de la même façon dans le même fichier) —
grouper sous un seul finding avec toutes les localisations listées, sauf si le contexte
d'exploitation diffère réellement entre elles.

## Livrable

- Si l'audit porte sur un fichier ou un petit extrait (< ~150 lignes de rapport), répondre
  directement dans la conversation.
- Si l'audit porte sur plusieurs fichiers ou un repo entier et que le rapport est long,
  le livrer en artifact Markdown (voir règles standard de création de fichiers) plutôt
  que de saturer le chat.
- Ne jamais inventer un ID CAPEC ou CWE qui ne figure pas dans `references/` ou dont
  l'existence n'est pas certaine. En cas de doute sur l'ID exact d'un pattern non couvert
  par le référentiel, dire "pattern CAPEC apparenté à [famille], ID à vérifier" plutôt
  que d'inventer un numéro.

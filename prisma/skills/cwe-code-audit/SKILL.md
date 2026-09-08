---
name: cwe-code-audit
description: Audite du code source pour y détecter des faiblesses en les mappant à la taxonomie MITRE CWE (Common Weakness Enumeration), organisée selon la vue CWE-699 (Software Development). Utilise ce skill dès que l'utilisateur demande un audit de sécurité, une revue de vulnérabilités, une analyse de code pour détecter des failles ou des mauvaises pratiques, un pentest statique, ou mentionne CWE/OWASP sur du code qu'il fournit ou qui est dans le repo. Déclenche-toi même si l'utilisateur ne cite pas explicitement "CWE" — toute demande du type "audite ce code", "trouve les failles de sécurité", "revois la qualité de ce fichier" sur du code source doit utiliser ce skill. Si le skill capec-code-audit est aussi disponible et que l'utilisateur veut un audit orienté "comment un attaquant procéderait", privilégier capec-code-audit ; pour un audit orienté "quels types de défauts contient ce code", utiliser ce skill-ci.
metadata:
  origin: Arboris
---

# Audit de code source via la taxonomie CWE-699

Ce skill structure une revue de code en s'appuyant sur la vue officielle MITRE
**CWE-699 (Software Development)**, qui organise les faiblesses logicielles par
concepts rencontrés dans le développement (injection, authentification, gestion
mémoire, logique métier...) plutôt que par mécanisme d'attaque. C'est un skill
indépendant du skill `capec-code-audit` : même méthodologie générale, référentiel
différent (CWE plutôt que CAPEC), utile en complément ou seul.

Ce skill ne remplace pas un SAST outillé (Semgrep, CodeQL, SonarQube) — c'est une
revue manuelle guidée par une taxonomie reconnue, pour un rapport structuré et traçable.

## Important — usage de CWE-699 lui-même

CWE-699 est marqué **"Vulnerability Mapping: PROHIBITED"** par MITRE : c'est une vue
organisationnelle (un conteneur de catégories), pas une faiblesse en soi. **Ne jamais
citer "CWE-699" comme référence d'un finding.** Toujours citer la CWE *feuille*
exacte (ex: CWE-89, CWE-327), en mentionnant si utile la catégorie parente entre
parenthèses pour le contexte (ex: "CWE-89 — SQL Injection (catégorie CWE-74 Injection)").

## Portée

Le référentiel couvre les catégories de CWE-699 les plus pertinentes pour une revue de
code, réparties dans `references/` :

- `references/01-security-critical.md` — Injection (CWE-74), Authentication Errors
  (CWE-1211), Authorization Errors (CWE-1212), Credentials Management (CWE-255),
  Cryptographic Issues (CWE-310), Key Management Errors (CWE-320)
- `references/02-memory-resources-concurrency.md` — Memory Buffer Errors (CWE-1218),
  Numeric Errors (CWE-1225), File Handling Issues (CWE-1219), Concurrency/Locking
  (CWE-557/1223), Resource Management Errors (CWE-399), Input Validation (CWE-1215),
  Error Handling (CWE-388)
- `references/03-business-logic-state-exposure.md` — Business Logic Errors (CWE-840),
  Behavioral Problems (CWE-438), Communication Channel Errors (CWE-417), exposition
  d'information (famille CWE-200), API/Function Errors (CWE-1228), Bad Coding Practices
  (CWE-1006) et Encapsulation Issues (CWE-1227) — ces deux dernières catégories couvrent
  aussi la qualité/maintenabilité, pas seulement la sécurité pure (voir section Périmètre).

**Charger les fichiers pertinents selon le langage et le type de code** avant de
commencer : pas la peine d'ouvrir `02-memory-resources-concurrency.md` en entier pour
un module JS pur sans opérations fichier/concurrence, la partie buffer/pointeurs ne
s'appliquant qu'aux langages à gestion mémoire manuelle (C/C++, et dans une moindre
mesure code natif Java/Rust via FFI).

## Périmètre : sécurité + qualité/maintenabilité

Contrairement à un audit purement offensif, ce skill couvre aussi les catégories
CWE-699 de qualité de code qui n'ont pas d'impact sécurité direct mais qui augmentent
la probabilité de failles ou nuisent à la maintenabilité (Bad Coding Practices,
Encapsulation Issues, une partie de Behavioral Problems). Ces findings :
- sont toujours classés en sévérité **Faible** ou **Info** (jamais Moyenne+, sauf si
  le défaut a une conséquence sécurité démontrable — auquel cas c'est un finding
  sécurité normal, pas un finding qualité)
- sont regroupés dans une section séparée du rapport, après les findings sécurité
  (voir section Format du rapport)
- ne doivent pas diluer les vrais findings sécurité : si le code contient beaucoup de
  petits défauts de qualité, en donner un échantillon représentatif plutôt qu'une
  liste exhaustive de chaque occurrence

## Méthodologie d'audit

### 1. Cadrage rapide

Avant de lire le code ligne par ligne, identifier :
- Langage(s), frameworks, gestion mémoire manuelle ou non (élimine des catégories :
  pas de CWE-119/787 buffer overflow classique en JS/Python/Java managé)
- Surface exposée : input utilisateur direct (route HTTP, CLI, fichier uploadé) ou
  code interne/de confiance
- Présence de secrets, DB, auth, upload, opérations concurrentes, calculs numériques
  sensibles (financier, quotas)

### 2. Lecture systématique par catégorie

Dans l'ordre de priorité pour une revue de code web/backend typique :

1. **Injection et validation d'entrée** (CWE-74, CWE-20, CWE-1215) : tracer chaque
   source d'input jusqu'à son utilisation ; tout sink dangereux sans validation
   adaptée est un finding.
2. **Authentification et autorisation** (CWE-1211, CWE-1212, CWE-840 pour IDOR) :
   cohérence du contrôle d'accès par endpoint, gestion des tentatives, vérification
   de propriétaire de ressource.
3. **Secrets, identifiants, cryptographie** (CWE-255, CWE-310, CWE-320) : secrets en
   dur, algorithmes faibles, RNG non cryptographique, vérification de signature absente.
4. **Gestion mémoire et ressources** (CWE-1218, CWE-1225, CWE-399) — pertinent
   surtout en C/C++/code natif : buffer overflow, dépassement d'entier, fuite de
   ressource, absence de limite.
5. **Concurrence et état** (CWE-557/1223, CWE-840 workflow) : race conditions,
   TOCTOU, machine à états contournable.
6. **Gestion des fichiers et de l'upload** (CWE-1219) : path traversal, upload non
   restreint, symlink non vérifié.
7. **Gestion des erreurs et exposition d'information** (CWE-388, famille CWE-200) :
   messages d'erreur verbeux, stack traces, secrets dans les logs/réponses.
8. **Comportement et logique métier** (CWE-438, CWE-840) : ordre des opérations,
   opérateurs incorrects, workflows contournables.
9. **Qualité/maintenabilité** (CWE-1006, CWE-1227) — en fin de revue, sévérité
   Faible/Info uniquement.

Pour chaque catégorie, consulter le tableau correspondant dans `references/` pour
l'ID CWE exact et les indices de détection.

### 3. Qualification de chaque finding

- **Exploitabilité réelle** : tracer effectivement la donnée de la source non fiable
  jusqu'au sink. Une validation existante mais insuffisante doit être décrite
  précisément (quel cas elle rate) plutôt que classée par défaut.
- **Contexte** : adapter la sévérité au contexte réel (un secret en dur dans un script
  interne jamais déployé n'a pas le même impact qu'une clé API en dur dans un
  frontend public).
- En cas de doute réel après lecture attentive, classer en **Faible/Info** avec le
  doute explicité, plutôt que d'arrondir arbitrairement.

### 4. Sévérité

Deux éléments par finding :
- **Label** : Critique / Haute / Moyenne / Faible / Info
- **Score CVSS estimé** : estimation raisonnée à partir de la valeur indicative du
  tableau de référence, ajustée au contexte réel (exposition publique vs interne,
  authentifié vs non, impact réel du défaut dans ce code précis).

Barème des labels (identique au skill CAPEC pour cohérence) :
- **Critique** (9.0–10.0) : exécution de code arbitraire, prise de contrôle totale,
  accès non authentifié à des données sensibles à grande échelle
- **Haute** (7.0–8.9) : contournement d'authentification/autorisation, accès à des
  données d'autres utilisateurs, injection à impact limité
- **Moyenne** (4.0–6.9) : fuite d'information limitée, DoS applicatif, faiblesse
  nécessitant des conditions préalables significatives
- **Faible** (0.1–3.9) : durcissement recommandé, pas d'exploitation directe évidente,
  ou défaut de qualité avec risque sécurité indirect
- **Info** : bonne pratique manquante ou défaut de qualité sans impact sécurité
  direct démontrable

### 5. Format du rapport

Deux sections : **Findings de sécurité** (Critique → Haute → Moyenne → Faible/Info),
puis **Findings de qualité/maintenabilité** (Faible/Info uniquement) si le périmètre
qualité a été activé.

Pour chaque finding :

```
### [SÉVÉRITÉ] Titre court de la faiblesse
- **CWE** : CWE-XX — Nom officiel (catégorie parente CWE-YY si utile)
- **CVSS estimé** : X.X (label)
- **Localisation** : fichier:ligne (ou plage de lignes)
- **Description** : ce qui se passe concrètement, en une à trois phrases
- **Impact** : conséquence concrète si exploité (ou, pour un finding qualité, risque
  indirect que ça introduit)
- **Remédiation** : correction concrète et actionnable
```

Grouper les findings de cause racine identique touchant plusieurs lignes similaires
sous une seule entrée avec toutes les localisations listées, sauf si le contexte
d'exploitation diffère réellement.

Terminer par un résumé : nombre de findings par sévérité (séparément pour sécurité et
qualité), et les 1-3 priorités à corriger en premier si le temps est limité.

## Livrable

- Audit d'un fichier ou petit extrait (< ~150 lignes de rapport) : répondre
  directement dans la conversation.
- Audit de plusieurs fichiers ou d'un repo entier avec rapport long : livrer en
  artifact Markdown plutôt que saturer le chat.
- Ne jamais inventer un ID CWE qui ne figure pas dans `references/` ou dont
  l'existence n'est pas certaine. En cas de doute sur l'ID exact d'une faiblesse non
  couverte par le référentiel, dire "faiblesse apparentée à [catégorie], ID à
  vérifier" plutôt que d'inventer un numéro.

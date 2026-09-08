# CAPEC-172 — Manipulate Timing and State

Mécanisme : exploiter le temps ou l'ordre d'exécution (races, désynchronisation d'état).

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-26 | Leveraging Race Conditions | CWE-362 | Haute (7.5) | Vérification puis action non atomique (TOCTOU), absence de verrou/transaction sur ressource partagée |
| CAPEC-29 | Leveraging Time-of-Check and Time-of-Use (TOCTOU) Race Conditions | CWE-367 | Haute (8.1) | `if exists(file) then open(file)` sans opération atomique, vérification de solde puis débit non transactionnel |
| CAPEC-25 | Forced Deadlock | CWE-833 | Moyenne | Acquisition de verrous multiples sans ordre cohérent |
| CAPEC-172 (sous-pattern générique) | State manipulation via prévisibilité | CWE-372 | Moyenne | Machine à états atteignable dans un ordre non prévu (ex: skip d'étape de paiement) |
| CAPEC-27 | Leveraging Race Conditions via Symbolic Links | CWE-367, CWE-59 | Haute | Création de fichier temporaire avec nom prévisible + lien symbolique |

# CAPEC-210 — Abuse Existing Functionality

Mécanisme : détourner une fonctionnalité légitime de l'application vers un usage non prévu.

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-212 | Functionality Misuse | CWE-434, CWE-441 | Moyenne | Fonction d'upload/export détournable (ex: SSRF via "importer une URL") |
| CAPEC-216 | Communication Channel Manipulation | CWE-441 | Haute | Confused deputy — le serveur agit comme proxy non filtré pour l'attaquant |
| CAPEC-664 | Server Side Request Forgery (SSRF) | CWE-918 | Critique (9.1) | Requête sortante (`fetch`, `axios.get`, `requests.get`, `HttpClient`) construite avec une URL fournie par l'utilisateur, sans liste blanche d'hôtes ni filtrage des IP privées/metadata (169.254.169.254) |
| CAPEC-220 | Client-Server Protocol Manipulation | CWE-290 | Moyenne | Logique métier dupliquée uniquement côté client, absente côté serveur |
| CAPEC-13 | Subverting Environment Variable Values | CWE-15 | Moyenne | Comportement de sécurité conditionné par une variable d'environnement modifiable |
| CAPEC-183 | IMAP/SMTP Command Injection | CWE-93, CWE-88 | Haute | En-têtes email construits par concaténation (`To:`, `Subject:` depuis input) → Email/Header Injection |
| CAPEC-680 | Query System for Data | CWE-200 | Faible | Endpoint de debug/diagnostic exposé en production |
| CAPEC-13 (2e occurrence liée) | Mass Assignment / Autobinding | CWE-915 | Haute (8.1) | Désérialisation directe du body JSON vers un modèle ORM sans liste blanche de champs (`Model.create(req.body)`, `@ModelAttribute` sans DTO) |
| CAPEC-586 | (rappel) | — | — | voir injection |
| CAPEC-461 | Web Services API Signature Forgery Leveraging Hash Function Extension Weakness | CWE-347 | Haute | Vérification de signature vulnérable à l'extension de longueur (MD5/SHA1 sans HMAC) |
| CAPEC-471 | (rappel search order hijacking) | — | — | voir structures |
| CAPEC-490 | Amplification | CWE-770 | Moyenne | Endpoint générant une réponse disproportionnée par rapport à la requête (déni de service applicatif) |
| CAPEC-125 | Flooding | CWE-770, CWE-400 | Moyenne (7.5) | Absence de rate-limiting sur endpoint coûteux (login, recherche, envoi d'email) |
| CAPEC-130 | Excessive Allocation | CWE-789, CWE-400 | Moyenne | Taille d'entrée non bornée avant allocation (upload, décompression de zip bomb) |
| CAPEC-197 | Exponential Data Expansion | CWE-409 | Haute | Décompression sans limite de ratio (zip bomb, XML entity expansion — voir aussi XXE) |
| CAPEC-100 (DoS variante) | Resource exhaustion via regex | CWE-1333 | Moyenne (7.5) | Regex vulnérable au ReDoS (quantificateurs imbriqués `(a+)+`) appliquée à une entrée utilisateur |

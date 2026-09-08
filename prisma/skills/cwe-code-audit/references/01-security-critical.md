# Catégories CWE-699 — Sécurité critique (Injection, Authentification, Autorisation, Cryptographie)

Note générale : CWE-699 est une vue racine (usage "PROHIBITED" pour le mapping direct).
Ne jamais citer "CWE-699" comme référence d'un finding — toujours citer la CWE feuille
(ex: CWE-89), avec éventuellement la catégorie parente entre parenthèses pour contexte.

## CWE-74 (Category) — Injection

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-89 | SQL Injection | Critique (9.8) | Concaténation dans requête SQL, absence de requête préparée |
| CWE-78 | OS Command Injection | Critique (9.8) | `exec`, `system`, `subprocess` avec entrée utilisateur |
| CWE-79 | Cross-Site Scripting (XSS) | Haute (7.4–8.8) | Sortie non échappée dans HTML/JS, `innerHTML`, `dangerouslySetInnerHTML` |
| CWE-90 | LDAP Injection | Haute (8.1) | Filtre LDAP construit par concaténation |
| CWE-91 | XML Injection | Haute (7.5) | Construction XML par concaténation |
| CWE-94 | Code Injection | Critique (9.8) | `eval()`, `Function()`, désérialisation dynamique de code |
| CWE-93 | CRLF Injection | Haute | Injection de retour chariot dans en-têtes/logs |
| CWE-643 | XPath Injection | Haute (8.2) | Requête XPath construite par concaténation |
| CWE-917 | Expression Language Injection | Haute | EL/OGNL/SpEL évalué avec entrée utilisateur (Java) |
| CWE-943 | Improper Neutralization in Data Query Logic (NoSQL) | Critique (9.1) | Filtres NoSQL construits depuis JSON brut d'entrée |

## CWE-1211 (Category) — Authentication Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-287 | Improper Authentication | Critique (9.1) | Logique d'auth incohérente, chemin de contournement |
| CWE-306 | Missing Authentication for Critical Function | Critique (9.1) | Endpoint sensible sans vérification d'identité |
| CWE-289 | Authentication Bypass by Alternate Name | Haute | Vérification sur un seul alias/casse d'un identifiant |
| CWE-290 | Authentication Bypass by Spoofing | Haute | Confiance dans une donnée usurpable (IP, header, referer) |
| CWE-294 | Authentication Bypass by Capture-replay | Haute | Absence de nonce/timestamp anti-rejeu sur token d'auth |
| CWE-295 | Improper Certificate Validation | Haute (7.4) | `rejectUnauthorized: false`, `verify=False`, TrustManager permissif |
| CWE-307 | Improper Restriction of Excessive Authentication Attempts | Haute (7.5) | Endpoint de login sans rate-limit ni verrouillage |
| CWE-308 | Use of Single-factor Authentication | Moyenne | MFA absent sur fonction sensible (admin, paiement) |
| CWE-309 | Use of Password System for Primary Authentication | Info | Mot de passe seul comme unique facteur pour accès critique |
| CWE-603 | Use of Client-Side Authentication | Critique (9.1) | Vérification d'auth faite côté client uniquement (JS), absente côté serveur |
| CWE-645 | Overly Restrictive Account Lockout Mechanism | Moyenne | Verrouillage de compte déclenchable par un tiers (DoS ciblé) |
| CWE-804 | Guessable CAPTCHA | Faible | CAPTCHA trivialement automatisable |
| CWE-836 | Use of Password Hash Instead of Password for Authentication | Haute | Comparaison directe de hash côté client au lieu du mot de passe |

## CWE-1212 (Category) — Authorization Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-862 | Missing Authorization | Haute (8.1) | Endpoint accessible sans vérification de permission |
| CWE-863 | Incorrect Authorization | Haute (8.1) | Vérification de permission présente mais logiquement fausse |
| CWE-425 | Direct Request ('Forced Browsing') | Haute | URL/route sensible devinable, sans contrôle d'accès |
| CWE-551 | Incorrect Behavior Order: Authorization Before Parsing and Canonicalization | Haute | Autorisation vérifiée avant décodage complet de l'URL |
| CWE-552 | Files or Directories Accessible to External Parties | Haute (7.5) | Fichiers sensibles servis statiquement (`.env`, `.git/`) |
| CWE-639 | Authorization Bypass Through User-Controlled Key (IDOR) | Haute (8.1) | ID de ressource accepté sans vérifier l'appartenance à l'utilisateur |
| CWE-653 | Improper Isolation or Compartmentalization | Haute | Logique multi-tenant sans cloisonnement strict |
| CWE-1220 | Insufficient Granularity of Access Control | Moyenne | Contrôle d'accès "tout ou rien" au lieu de permissions fines |
| CWE-1230 | Exposure of Sensitive Information Through Metadata | Moyenne | Métadonnées (en-têtes, JSON annexe) révélant des données protégées |

## CWE-255 (Category) — Credentials Management Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-256 | Plaintext Storage of a Password | Critique (9.1) | Mot de passe stocké sans hash |
| CWE-257 | Storing Passwords in a Recoverable Format | Critique | Chiffrement réversible au lieu de hash à sens unique |
| CWE-259 | Use of Hard-coded Password | Critique (9.8) | Mot de passe/secret en dur dans le code |
| CWE-798 | Use of Hard-coded Credentials | Critique (9.8) | Clé API, token, identifiants en dur |
| CWE-262 | Not Using Password Aging | Faible | Absence de politique d'expiration (contexte-dépendant) |
| CWE-263 | Password Aging with Long Expiration | Faible | idem |
| CWE-522 | Insufficiently Protected Credentials | Haute (7.5) | Identifiants transmis/stockés sans chiffrement adéquat |

## CWE-310 (Category) — Cryptographic Issues

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-321 | Use of Hard-coded Cryptographic Key | Critique (9.1) | Clé de chiffrement en dur dans le code source |
| CWE-322 | Key Exchange without Entity Authentication | Haute | Échange de clé sans authentification de l'interlocuteur |
| CWE-325 | Missing Cryptographic Step | Haute | Étape de vérification crypto omise (ex: pas de vérif MAC) |
| CWE-326 | Inadequate Encryption Strength | Haute (7.5) | Taille de clé insuffisante (RSA < 2048, AES-128 si politique exige 256) |
| CWE-327 | Use of a Broken or Risky Cryptographic Algorithm | Haute (7.5) | DES, RC4, MD5/SHA1 pour intégrité, ECB mode |
| CWE-329 | Generation of Predictable IV with CBC Mode | Haute | IV fixe ou réutilisé en mode CBC |
| CWE-330 | Use of Insufficiently Random Values | Haute (8.1) | `Math.random()`/`rand()` pour token de sécurité au lieu de CSPRNG |
| CWE-347 | Improper Verification of Cryptographic Signature | Critique (9.1) | Signature JWT/JWS non vérifiée ou `alg: none` accepté |
| CWE-780 | Use of RSA Algorithm without OAEP | Moyenne | Padding PKCS#1 v1.5 au lieu d'OAEP |

## CWE-320 (Category) — Key Management Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-321 | (rappel) Hard-coded Cryptographic Key | — | voir ci-dessus |
| CWE-324 | Use of a Key Past its Expiration Date | Moyenne | Absence de rotation/vérification d'expiration de clé |

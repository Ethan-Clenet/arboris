# CAPEC-223 — Employ Probabilistic Techniques

Mécanisme : exploiter le hasard/la prévisibilité (brute-force, faiblesses cryptographiques).

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-49 | Password Brute Forcing | CWE-307, CWE-521 | Haute (7.5) | Endpoint de login sans limitation de tentatives, sans verrouillage de compte, sans CAPTCHA |
| CAPEC-16 | Dictionary-based Password Attack | CWE-521 | Haute | Politique de mot de passe absente/faible |
| CAPEC-55 | Rainbow Table Password Cracking | CWE-759, CWE-916 | Haute (7.5) | Hash de mot de passe sans sel, `MD5`/`SHA1` utilisé pour stocker un mot de passe au lieu de bcrypt/argon2/scrypt |
| CAPEC-97 | Cryptanalysis | CWE-327, CWE-326 | Haute (7.5) | Algorithme crypto obsolète/custom (DES, RC4, ECB), taille de clé insuffisante |
| CAPEC-112 | Brute Force | CWE-307 | Haute | Absence générale de throttling sur mécanisme sensible (reset password, OTP) |
| CAPEC-70 | Try Common or Default Usernames and Passwords | CWE-1391, CWE-521 | Haute (9.8 si trouvé) | Identifiants par défaut laissés actifs (admin/admin) |
| CAPEC-59 | Session Credential Falsification through Prediction | CWE-330 | Haute (8.1) | Génération de token de session/reset via `Math.random()` ou générateur non cryptographique au lieu de CSPRNG (`crypto.randomBytes`, `secrets` module) |
| CAPEC-460 | (rappel) | — | — | voir injection |

# Volets "code-visibles" de Collect and Analyze Information (CAPEC-118)

La majorité de CAPEC-118 concerne du recon réseau/OSINT hors périmètre revue de code.
Seuls ces sous-patterns laissent une signature exploitable en lisant le code :

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-116 | Excavation | CWE-200, CWE-209 | Moyenne (5.3) | Messages d'erreur détaillés renvoyés au client (stack trace, requête SQL, chemin serveur) |
| CAPEC-54 | Query System for Information | CWE-200 | Faible | Endpoints `/version`, `/debug`, `/actuator` exposés sans authentification |
| CAPEC-215 | Fuzzing for Application Mapping | CWE-200 | Faible | N/A — technique d'attaque, pas un défaut de code en soi |
| CAPEC-150 | Collect Data from Common Resource Locations | CWE-538, CWE-540 | Haute (7.5) | Fichiers sensibles servis statiquement (`.env`, `.git/`, `.DS_Store`, backups `.sql`, `.bak` accessibles via le webroot) |
| CAPEC-508 | Shoulder Surfing | — | — | Hors périmètre code |
| CAPEC-13 | (rappel) | — | — | voir abuse existing functionality |
| CAPEC-37 | Retrieve Embedded Sensitive Data | CWE-540, CWE-798 | Haute (7.5) | Clés API, secrets, tokens en dur dans le code source, les commentaires, ou l'historique git |
| CAPEC-204 | Lifting Sensitive Data Embedded in Cache | CWE-524 | Moyenne | Données sensibles mises en cache (navigateur ou serveur) sans en-têtes `Cache-Control: no-store` |
| CAPEC-169 | Footprinting (volet applicatif) | CWE-200 | Faible | En-têtes serveur révélant versions précises (`Server: Apache/2.4.1`, `X-Powered-By`) |

# Volets "code-visibles" de Manipulate System Resources (CAPEC-262)

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-478 | (rappel) | — | — | voir structures de données |
| CAPEC-540 | Overread Buffers | CWE-125 | Haute | Lecture hors limites (Heartbleed-like), absence de vérification de longueur avant lecture |
| CAPEC-129 | (rappel pointeurs) | — | — | voir structures |
| CAPEC-624 | Hardware Fault Injection | — | — | Hors périmètre code source |
| CAPEC-176 | Configuration/Environment Manipulation | CWE-15, CWE-668 | Moyenne | Fichier de configuration en écriture par un utilisateur non privilégié, secrets en clair dans fichier de config versionné |
| CAPEC-186 | Malicious Software Update | CWE-494 | Haute | Mécanisme de mise à jour sans vérification de signature/intégrité |

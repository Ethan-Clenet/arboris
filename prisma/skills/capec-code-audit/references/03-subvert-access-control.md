# CAPEC-225 — Subvert Access Control

Mécanisme : contourner, escalader ou usurper des droits d'accès plutôt que de les
obtenir légitimement. Famille très pertinente pour du code d'auth/autorisation.

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-1 | Accessing Functionality Not Properly Constrained by ACLs | CWE-732, CWE-284 | Haute (8.1) | Endpoint/route sans middleware d'autorisation, contrôle d'accès fait uniquement côté UI |
| CAPEC-58 | Restful Privilege Elevation | CWE-285 | Haute (8.1) | Vérification de rôle absente sur certaines méthodes HTTP (PUT/DELETE) d'une même ressource |
| CAPEC-127 | Directory Indexing | CWE-548 | Faible (5.3) | Listing de répertoire activé, absence de fichier index |
| CAPEC-561 | Windows Admin Shares with Stolen Credentials | CWE-306 | Haute | Partage admin accessible sans MFA |
| CAPEC-115 | Authentication Bypass | CWE-287, CWE-306 | Critique (9.1) | Vérification d'auth désactivable via paramètre, fonction d'auth avec chemin de sortie anticipé (`return true` de debug) |
| CAPEC-114 | Authentication Abuse | CWE-287 | Haute | Réutilisation de logique d'auth de façon non prévue |
| CAPEC-593 | Session Hijacking | CWE-384, CWE-613 | Haute (8.1) | Token de session prévisible, absence de régénération après login, cookie sans `HttpOnly`/`Secure` |
| CAPEC-21 | Exploitation of Trusted Identifiers | CWE-290 | Haute | Confiance dans un identifiant côté client sans revalidation serveur |
| CAPEC-31 | Accessing/Intercepting/Modifying HTTP Cookies | CWE-315, CWE-565 | Haute | Données sensibles stockées en clair dans cookie, absence de signature/HMAC |
| CAPEC-39 | Manipulating Opaque Client-based Data Tokens | CWE-642 | Haute (8.1) | État/permissions stockés côté client (JWT, cookie) sans validation d'intégrité serveur |
| CAPEC-196 | Session Credential Falsification through Forging | CWE-290, CWE-345 | Critique | JWT avec `alg: none` accepté, absence de vérification de signature |
| CAPEC-61 | Session Fixation | CWE-384 | Haute (7.5) | ID de session accepté depuis l'URL/paramètre avant authentification |
| CAPEC-107 | Cross Site Tracing | CWE-693 | Moyenne | Méthode HTTP TRACE activée |
| CAPEC-62 | Cross Site Request Forgery (CSRF) | CWE-352 | Haute (8.1) | Action state-changing (POST/PUT/DELETE) sans token CSRF ni vérification `Origin`/`SameSite` |
| CAPEC-141 | Cache Poisoning | CWE-524 | Haute | En-têtes de cache mal configurés sur contenu sensible/dynamique |
| CAPEC-233 | Privilege Escalation | CWE-269 | Critique (8.8) | Changement de rôle/permission côté client accepté tel quel, absence de re-vérification serveur après élévation |
| CAPEC-122 | Privilege Abuse | CWE-269 | Haute | Compte de service avec droits excessifs utilisé pour des opérations non prévues |
| CAPEC-180 | Exploiting Incorrectly Configured Access Control Security Levels | CWE-732 | Haute | Permissions par défaut trop larges (fichiers, S3 bucket, DB) |
| CAPEC-17 | Using Malicious Files | CWE-434 | Haute (8.8) | Upload de fichier sans validation de type MIME réel / extension exécutable acceptée |
| CAPEC-586 | (voir injection) Object Injection via Insecure Deserialization | CWE-502 | Critique | cf. fichier injection |
| CAPEC-560 | Use of Known Domain Credentials | CWE-798 | Critique (9.8) | Identifiants/API keys en dur dans le code source |
| CAPEC-191 | (voir reverse engineering) Read Sensitive Constants Within an Executable | CWE-798, CWE-321 | Haute | Secrets/clés cryptographiques hardcodés |
| CAPEC-509 | Kerberoasting | CWE-522 | Haute | Hors périmètre code source pur, mentionné pour complétude infra |
| CAPEC-560 | IDOR (Insecure Direct Object Reference, souvent classé ici) | CWE-639 | Haute (8.1) | Accès à une ressource via ID séquentiel/prévisible sans vérifier que l'utilisateur en est propriétaire |

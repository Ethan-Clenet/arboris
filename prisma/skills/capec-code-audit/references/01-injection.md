# CAPEC-152 — Inject Unexpected Items

Mécanisme : l'adversaire fournit une entrée contenant des données/instructions non attendues
que le composant cible interprète et exécute au lieu de simplement traiter comme donnée.
C'est la famille la plus fréquente en revue de code source.

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-66 | SQL Injection | CWE-89 | Critique (9.8) | Concaténation de string dans une requête SQL, `query(` + `+`/`f"..."`/template literal, absence de requête préparée/paramétrée, ORM utilisé avec `.raw()` / `sequelize.query(rawSQL)` |
| CAPEC-108 | Command Line Execution through SQL Injection | CWE-89, CWE-78 | Critique (9.8) | `xp_cmdshell`, injection SQL menant à exécution système |
| CAPEC-7 | Blind SQL Injection | CWE-89 | Haute (8.6) | Requêtes SQL dynamiques sans retour direct de données, basées sur timing/booléen |
| CAPEC-676 | NoSQL Injection | CWE-943 | Critique (9.1) | Construction dynamique de filtres Mongo/Couch (`$where`, objets JSON depuis input brut) |
| CAPEC-250 | XML Injection | CWE-91 | Haute (7.5) | Concaténation dans construction XML, absence d'échappement d'entités |
| CAPEC-83 | XPath Injection | CWE-643 | Haute (8.2) | `evaluate()` XPath avec entrée utilisateur concaténée |
| CAPEC-136 | LDAP Injection | CWE-90 | Haute (8.1) | Filtres LDAP construits par concaténation |
| CAPEC-78 | Using Escaped Slashes in Alternate Encoding | CWE-172 | Moyenne (5.3) | Décodage incomplet avant validation |
| CAPEC-79 | Using Slashes in Alternate Encoding | CWE-172 | Moyenne (5.3) | idem, contournement de filtre path/WAF |
| CAPEC-88 | OS Command Injection | CWE-78 | Critique (9.8) | `exec()`, `child_process.exec`, `os.system`, `subprocess.shell=True`, `Runtime.exec` avec entrée utilisateur non échappée |
| CAPEC-6 | Argument Injection | CWE-88 | Haute (8.0) | Construction dynamique d'arguments CLI depuis input |
| CAPEC-242 | Code Injection | CWE-94 | Critique (9.8) | `eval()`, `Function()`, `exec()` Python, désérialisation dynamique de code |
| CAPEC-35 | Leverage Executable Code in Non-Executable Files | CWE-96 | Haute | Upload de fichiers interprétés comme scripts (ex: `.php` déguisé en image) |
| CAPEC-77 | Manipulating User-Controlled Variables | CWE-20 | Moyenne | Variables globales/superglobales modifiables (`register_globals`, prototype pollution) |
| CAPEC-201 | Serialized Data External Linking | CWE-611 | Haute | XXE via désérialisation XML |
| CAPEC-586 | Object Injection | CWE-502 | Critique (9.0) | `pickle.loads()`, `unserialize()` PHP, `ObjectInputStream.readObject()` Java sans validation, `yaml.load()` (non `safe_load`) |
| CAPEC-19 | Embedding Scripts within Scripts | CWE-94 | Haute | Templates rendant du contenu utilisateur sans échappement (SSTI) — Jinja2/Twig/Freemarker `render_template_string` avec input |
| CAPEC-63 | Cross-Site Scripting (XSS, générique) | CWE-79 | Haute (7.4–8.8 selon contexte) | `innerHTML =`, `dangerouslySetInnerHTML`, `v-html`, sortie non échappée dans template serveur, absence de CSP |
| CAPEC-591 | Reflected XSS | CWE-79 | Haute (7.1) | Paramètre de requête renvoyé tel quel dans la réponse HTML |
| CAPEC-592 | Stored XSS | CWE-79 | Critique (8.7) | Contenu utilisateur stocké puis rendu sans échappement (commentaires, profils) |
| CAPEC-588 | DOM-Based XSS | CWE-79 | Haute (7.4) | `document.write`, `location.hash` réinjecté dans le DOM |
| CAPEC-460 | HTTP Parameter Pollution (HPP) | CWE-235 | Moyenne (5.4) | Parsing incohérent de paramètres dupliqués |
| CAPEC-267 | Leverage Alternate Encoding | CWE-176 | Moyenne | Contournement de filtre par encodage (UTF-7, double URL-encoding) |
| CAPEC-273 | HTTP Response Smuggling | CWE-444 | Haute | En-têtes ambigus Content-Length/Transfer-Encoding construits manuellement |
| CAPEC-105 | HTTP Request Splitting | CWE-93 | Haute | Injection de CRLF dans en-têtes construits dynamiquement |
| CAPEC-34 | HTTP Response Splitting | CWE-113 | Haute (7.5) | En-têtes de réponse construits avec entrée utilisateur non filtrée (`\r\n`) |
| CAPEC-153 | Input Data Manipulation (parent générique) | CWE-20 | — | Catégorie parente, voir sous-patterns |

# Catégories CWE-699 — Logique métier, État, Communication, Exposition d'information

## CWE-840 (Category) — Business Logic Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-283 | Unverified Ownership | Haute | Ressource critique manipulée sans vérifier son propriétaire réel |
| CWE-639 | (rappel) Authorization Bypass Through User-Controlled Key (IDOR) | — | voir fichier sécurité critique |
| CWE-640 | Weak Password Recovery Mechanism for Forgotten Password | Haute (7.5) | Reset de mot de passe via question secrète faible, token prévisible, ou absence d'expiration |
| CWE-708 | Incorrect Ownership Assignment | Moyenne | Ressource assignée à un propriétaire hors du périmètre attendu |
| CWE-770 | (rappel) Allocation without Limits | — | voir fichier ressources |
| CWE-837 | Improper Enforcement of a Single, Unique Action | Moyenne (6.5) | Action censée être unique (paiement, vote) rejouable plusieurs fois |
| CWE-841 | Improper Enforcement of Behavioral Workflow | Moyenne | Étapes d'un processus métier atteignables dans le désordre (bypass d'étape de validation/paiement) |
| CWE-1050 | Excessive Platform Resource Consumption within a Loop | Moyenne | Boucle consommant des ressources (connexions, fichiers) sans libération intermédiaire |

## CWE-438 (Category) — Behavioral Problems

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-115 | Misinterpretation of Input | Moyenne | Format d'entrée mal interprété avec conséquence sécurité |
| CWE-179 | Incorrect Behavior Order: Early Validation | Haute | Validation effectuée avant une transformation qui peut réintroduire du danger (canonicalisation après filtre) |
| CWE-408 | Incorrect Behavior Order: Early Amplification | Moyenne | Opération coûteuse exécutée avant authentification/autorisation |
| CWE-444 | Inconsistent Interpretation of HTTP Requests (Request/Response Smuggling) | Haute (7.5) | Proxy/reverse-proxy interprétant différemment `Content-Length`/`Transfer-Encoding` |
| CWE-480 | Use of Incorrect Operator | Moyenne | `=` au lieu de `==`, `&` au lieu de `&&`, dans une condition de sécurité |
| CWE-484 | Omitted Break Statement in Switch | Moyenne | Fall-through non intentionnel dans un `switch` gérant des permissions/états |
| CWE-551 | (rappel) Authorization Before Canonicalization | — | voir fichier sécurité critique |
| CWE-698 | Execution After Redirect (EAR) | Moyenne | Code exécuté après un `redirect()` au lieu de `return` immédiat |
| CWE-733 | Compiler Optimization Removal of Security-critical Code | Moyenne | Effacement de secret en mémoire supprimé par l'optimiseur (rare, surtout C/C++) |
| CWE-783 | Operator Precedence Logic Error | Moyenne | Précédence d'opérateurs mal comprise dans une condition de sécurité |
| CWE-835 | Loop with Unreachable Exit Condition (Infinite Loop) | Moyenne | Boucle sans condition de sortie atteignable → DoS |

## CWE-417 (Category) — Communication Channel Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-346 | Origin Validation Error | Haute (8.1) | Vérification `Origin`/`Referer` absente ou contournable (CORS trop permissif, `Access-Control-Allow-Origin: *` avec credentials) |
| CWE-918 | Server-Side Request Forgery (SSRF) | Critique (9.1) | Requête sortante (`fetch`, `axios.get`, `requests.get`) construite avec une URL fournie par l'utilisateur, sans liste blanche d'hôtes ni filtrage des IP privées/metadata |
| CWE-385 | Covert Timing Channel | Moyenne | Temps de réponse variable révélant une information secrète (ex: comparaison de mot de passe non constante) |
| CWE-419 | Unprotected Primary Channel | Haute | Canal d'administration accessible sans protection (auth, réseau) |
| CWE-420 | Unprotected Alternate Channel | Haute | Fonctionnalité admin accessible via une route secondaire non protégée alors que la principale l'est |
| CWE-425 | (rappel) Direct Request / Forced Browsing | — | voir fichier sécurité critique |
| CWE-515 | Covert Storage Channel | Faible | Information transmise via un canal de stockage détourné |

## CWE-664 (Category, racine large) — Volets exposition d'information (CWE-200 family)

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-200 | Exposure of Sensitive Information to an Unauthorized Actor | Moyenne (5.3–7.5) | Donnée sensible renvoyée à un acteur qui ne devrait pas y avoir accès |
| CWE-201 | Insertion of Sensitive Information Into Sent Data | Moyenne | Champ interne/debug inclus par erreur dans une réponse API |
| CWE-203 | Observable Discrepancy | Moyenne | Réponse différente selon que la ressource/l'utilisateur existe (énumération d'utilisateurs via message d'erreur de login différent) |
| CWE-208 | Observable Timing Discrepancy | Moyenne | Temps de traitement différent révélant une information (ex: existence d'un compte) |
| CWE-209 | (rappel) Error Message with Sensitive Info | — | voir fichier mémoire/erreurs |
| CWE-213 | Exposure of Sensitive Information Due to Incompatible Policies | Faible | Réutilisation de données au-delà de la politique de confidentialité prévue |
| CWE-497 | Exposure of Sensitive System Information to an Unauthorized Control Sphere | Moyenne | Informations système (version, stack, config) exposées à des acteurs externes |
| CWE-538 | Insertion of Sensitive Information into Externally-Accessible File or Directory | Haute (7.5) | Fichier `.env`, backup, log contenant des secrets accessible via le webroot |
| CWE-540 | Inclusion of Sensitive Information in Source Code | Haute | Secrets/clés dans le code source versionné |

## CWE-1228 (Category) — API / Function Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-242 | Use of Inherently Dangerous Function | Haute | `gets()`, fonctions sans garantie de sécurité quelle que soit l'utilisation |
| CWE-477 | Use of Obsolete Function | Faible | Fonction dépréciée toujours utilisée |
| CWE-676 | Use of Potentially Dangerous Function | Moyenne | `strcpy`, `sprintf` — dangereux si mal utilisé, à remplacer par variante bornée |
| CWE-749 | Exposed Dangerous Method or Function | Haute | API interne dangereuse exposée sans restriction (ex: endpoint de désérialisation générique) |

## CWE-1006 (Category) — Bad Coding Practices (qualité, sévérité Faible/Info)

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-358 | Improperly Implemented Security Check for Standard | Moyenne | Implémentation d'un protocole/algo standard qui dévie de la spec sur un point sécurité |
| CWE-489 | Active Debug Code | Moyenne (5.3) | Code de debug/backdoor de test laissé actif en production |
| CWE-547 | Use of Hard-coded, Security-relevant Constants | Faible | Constante de sécurité en dur au lieu de configuration |
| CWE-561 | Dead Code | Info | Code mort, jamais exécuté |
| CWE-563 | Assignment to Variable without Use | Info | Variable assignée mais jamais utilisée |
| CWE-656 | Reliance on Security Through Obscurity | Moyenne | Sécurité reposant uniquement sur le secret de l'implémentation |
| CWE-654 | Reliance on a Single Factor in a Security Decision | Moyenne | Décision de sécurité basée sur une seule condition/donnée |
| CWE-807 | Reliance on Untrusted Inputs in a Security Decision | Haute (7.5) | Décision de sécurité (rôle, prix, quantité) basée sur une donnée modifiable côté client |
| CWE-1109 | Use of Same Variable for Multiple Purposes | Info | Variable réutilisée pour plusieurs usages, source de confusion/bug |
| CWE-1127 | Compilation with Insufficient Warnings or Errors | Info | Compilation sans niveau de warning strict (masque des bugs potentiels) |

## CWE-1227 (Category) — Encapsulation Issues (qualité, sévérité Faible/Info sauf cas sécurité)

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-485 | Insufficient Encapsulation | Faible | Champ censé être privé exposé publiquement |
| CWE-486 | Comparison of Classes by Name | Faible | Comparaison de type par nom de classe au lieu de mécanisme natif |
| CWE-487 | Reliance on Package-level Scope | Faible | Visibilité "package-private" utilisée comme mesure de sécurité (Java) |
| CWE-495 | Private Data Structure Returned From A Public Method | Moyenne | Structure interne mutable retournée sans copie défensive |
| CWE-496 | Public Data Assigned to Private Array-Typed Field | Moyenne | Référence externe assignée directement à un champ interne (pas de copie) |
| CWE-501 | Trust Boundary Violation | Haute (7.5) | Donnée non fiable et fiable mélangées dans la même structure sans marquage |

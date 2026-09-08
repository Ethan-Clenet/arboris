# Catégories CWE-699 — Mémoire, Ressources, Concurrence, Validation d'entrée, Erreurs

## CWE-1218 (Category) — Memory Buffer Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-119 | Improper Restriction of Operations within the Bounds of a Memory Buffer | Critique (9.8) | Accès mémoire sans vérification de bornes |
| CWE-120 | Buffer Copy without Checking Size of Input (Classic Buffer Overflow) | Critique (9.8) | `strcpy`, `strcat`, `sprintf`, `gets` |
| CWE-121 | Stack-based Buffer Overflow | Critique (9.8) | Écriture hors limites sur buffer alloué en pile |
| CWE-122 | Heap-based Buffer Overflow | Critique (9.8) | Écriture hors limites sur buffer alloué en tas |
| CWE-125 | Out-of-bounds Read | Haute (7.5) | Lecture au-delà de la longueur allouée/déclarée |
| CWE-787 | Out-of-bounds Write | Critique (9.8) | Écriture au-delà de la longueur allouée |
| CWE-131 | Incorrect Calculation of Buffer Size | Haute | Taille de buffer calculée sans marge (off-by-one, unité incorrecte) |
| CWE-170 | Improper Null Termination | Moyenne | Chaîne C non terminée par `\0` avant traitement |

## CWE-1225 (Category) — Numeric Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-190 | Integer Overflow or Wraparound | Haute (7.5) | Arithmétique sur taille/index sans vérification de dépassement |
| CWE-191 | Integer Underflow | Haute | Soustraction pouvant devenir négative sur type non signé |
| CWE-193 | Off-by-one Error | Moyenne | Boucle/index avec borne incorrecte de 1 |
| CWE-369 | Divide By Zero | Moyenne | Division sans vérification du diviseur |
| CWE-681 | Incorrect Conversion between Numeric Types | Moyenne | Cast implicite tronquant une valeur (long→int, float→int) |
| CWE-1339 | Insufficient Precision or Accuracy of a Real Number | Faible | Calcul financier en flottant au lieu de type décimal |

## CWE-1219 (Category) — File Handling Issues

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-22 | Improper Limitation of a Pathname to a Restricted Directory (Path Traversal) | Haute (7.5–8.6) | Chemin construit depuis input sans normalisation/vérification de préfixe |
| CWE-23 | Relative Path Traversal | Haute (7.5) | idem, variante relative |
| CWE-36 | Absolute Path Traversal | Haute (7.5) | Acceptation de chemin absolu non vérifié |
| CWE-59 | Improper Link Resolution Before File Access (Symlink Following) | Haute | Ouverture de fichier sans vérifier qu'il ne s'agit pas d'un lien symbolique détourné |
| CWE-73 | External Control of File Name or Path | Haute | Nom de fichier entièrement dérivé d'input utilisateur |
| CWE-98 | PHP Remote/Local File Inclusion | Critique (9.8) | `include`/`require` avec chemin partiellement/totalement contrôlé |
| CWE-434 | Unrestricted Upload of File with Dangerous Type | Haute (8.8) | Upload sans validation de type MIME réel ni d'extension |
| CWE-641 | Improper Restriction of Names for Files and Other Resources | Moyenne | Nom de ressource non filtré (caractères spéciaux, longueur) |

## CWE-1223 (Category) — Resource Locking Problems / CWE-557 Concurrency Issues

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-362 | Concurrent Execution using Shared Resource with Improper Synchronization (Race Condition) | Haute (7.5) | Accès concurrent à une ressource partagée sans verrou/transaction |
| CWE-367 | Time-of-check Time-of-use (TOCTOU) Race Condition | Haute (8.1) | Vérification puis action séparées, non atomiques |
| CWE-366 | Race Condition within a Thread | Moyenne | État partagé entre threads sans synchronisation |
| CWE-413 | Improper Resource Locking | Moyenne | Verrou non relâché correctement, ou absent |
| CWE-414 | Missing Lock Check | Haute | Modification de ressource sans vérifier le verrou |
| CWE-609 | Double-Checked Locking | Moyenne | Pattern DCL implémenté de façon non thread-safe |
| CWE-833 | Deadlock | Moyenne | Acquisition de verrous multiples dans un ordre incohérent |

## CWE-399 (Category) — Resource Management Errors

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-400 | Uncontrolled Resource Consumption | Moyenne (7.5) | Absence de limite sur taille d'entrée, nombre de connexions, mémoire allouée |
| CWE-401 | Missing Release of Memory after Effective Lifetime | Moyenne | Fuite mémoire (allocation sans libération correspondante) |
| CWE-404 | Improper Resource Shutdown or Release | Moyenne | Fichier/connexion/socket non fermé (absence de `finally`/`defer`/`try-with-resources`) |
| CWE-405 | Asymmetric Resource Consumption (Amplification) | Moyenne | Réponse serveur disproportionnée par rapport à la requête |
| CWE-459 | Incomplete Cleanup | Faible | Ressources temporaires non nettoyées après usage |
| CWE-770 | Allocation of Resources Without Limits or Throttling | Haute (7.5) | Endpoint coûteux sans rate-limiting ni quota |
| CWE-772 | Missing Release of Resource after Effective Lifetime | Moyenne | idem 404, formulation générique |
| CWE-789 | Uncontrolled Memory Allocation | Haute | Allocation basée sur une taille fournie par l'utilisateur sans plafond |

## CWE-19 (Category) — Data Processing Errors / CWE-1215 Input Validation

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-20 | Improper Input Validation | Haute (7.5) | Absence générale de validation avant traitement |
| CWE-129 | Improper Validation of Array Index | Haute | Index de tableau dérivé d'input sans vérification de plage |
| CWE-1284 | Improper Validation of Specified Quantity in Input | Moyenne | Quantité/taille annoncée dans l'input non revérifiée par rapport aux données réelles |
| CWE-1285 | Improper Validation of Specified Index, Position, or Offset in Input | Haute | Offset fourni par l'utilisateur utilisé sans validation |
| CWE-1287 | Improper Validation of Specified Type of Input | Moyenne | Type de donnée non vérifié avant traitement (type confusion) |

## CWE-388 (Category) — Error Handling

| CWE | Nom | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|
| CWE-209 | Generation of Error Message Containing Sensitive Information | Moyenne (5.3) | Stack trace, requête SQL ou chemin serveur renvoyés au client |
| CWE-248 | Uncaught Exception | Moyenne | Exception non catchée pouvant crasher le service ou exposer un état incohérent |
| CWE-390 | Detection of Error Condition Without Action | Moyenne | Erreur détectée mais silencieusement ignorée (`catch {}` vide) |
| CWE-391 | Unchecked Error Condition | Moyenne | Valeur de retour d'erreur non vérifiée |
| CWE-392 | Missing Report of Error Condition | Faible | Erreur survenue mais non journalisée/remontée |
| CWE-395 | Use of NullPointerException Catch to Detect NULL Pointer Dereference | Faible | Utilisation d'exception comme flux de contrôle normal |
| CWE-460 | Improper Cleanup on Thrown Exception | Moyenne | Ressource non libérée si une exception survient avant |
| CWE-544 | Missing Standardized Error Handling Mechanism | Info | Gestion d'erreur incohérente entre modules |

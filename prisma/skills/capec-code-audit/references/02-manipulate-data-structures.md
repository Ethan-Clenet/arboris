# CAPEC-255 — Manipulate Data Structures

Mécanisme : l'adversaire exploite les faiblesses dans la manière dont une structure de
données (buffer, pointeur, fichier, chemin) est manipulée ou référencée.

| CAPEC | Nom | CWE lié(s) | Sévérité type. | Signatures / indices dans le code |
|---|---|---|---|---|
| CAPEC-100 | Overflow Buffers | CWE-120, CWE-121, CWE-122 | Critique (9.8) | `strcpy`, `strcat`, `sprintf`, `gets` en C/C++ ; tailles de buffer fixes sans vérification |
| CAPEC-256 | SOAP Array Overflow | CWE-130 | Haute | Parsing SOAP/XML sans limite de taille de tableau |
| CAPEC-46 | Overflow Variables and Tags | CWE-131 | Haute | Calcul de taille incorrect avant allocation |
| CAPEC-47 | Buffer Overflow via Parameter Expansion | CWE-120 | Haute | Expansion de variables shell non bornée |
| CAPEC-8 | Buffer Overflow in an API Call | CWE-120 | Haute | Appel d'API avec buffer utilisateur sans validation de taille |
| CAPEC-9 | Buffer Overflow in Local Command-Line Utilities | CWE-120 | Haute | idem, utilitaires CLI locaux |
| CAPEC-10 | Buffer Overflow via Environment Variables | CWE-120 | Moyenne | Variables d'environnement copiées sans borne |
| CAPEC-14 | Client-side Injection-induced Buffer Overflow | CWE-120 | Haute | Traitement de réponse serveur non fiable côté client natif |
| CAPEC-24 | Filter Failure through Buffer Overflow | CWE-120 | Haute | Filtre de sécurité lui-même vulnérable au débordement |
| CAPEC-42 | MIME Conversion | CWE-120 | Moyenne | Parsing MIME non borné |
| CAPEC-44 | Overflow Binary Resource File | CWE-120 | Moyenne | Parsing de ressources binaires (images, fonts) sans validation |
| CAPEC-45 | Buffer Overflow via Symbolic Links | CWE-59 | Haute | Résolution de lien symbolique non contrôlée avant écriture |
| CAPEC-92 | Forced Integer Overflow | CWE-190, CWE-191 | Haute (7.5) | Calcul de taille/index sans vérification de dépassement, arithmétique sur input utilisateur avant allocation |
| CAPEC-129 | Pointer Manipulation | CWE-822, CWE-823 | Critique | Arithmétique de pointeurs non validée, cast non sûr |
| CAPEC-478 | Modification of Windows Service Configuration | CWE-15 | Haute | Écriture de config service accessible en écriture par utilisateur non privilégié |
| CAPEC-165 | File Manipulation | CWE-73 | Haute | Chemin de fichier construit depuis input sans normalisation |
| CAPEC-126 | Path Traversal | CWE-22 | Haute (7.5–8.6) | Concaténation `path + userInput`, absence de `path.resolve`/`normalize` + vérification de préfixe, `../` non filtré |
| CAPEC-64 | Using Slashes and URL Encoding to Bypass Validation | CWE-22, CWE-172 | Haute | Validation de chemin faite avant décodage URL |
| CAPEC-76 | Manipulating Web Input to File System Calls | CWE-22 | Haute | Paramètre HTTP utilisé directement comme nom de fichier |
| CAPEC-597 | Absolute Path Traversal | CWE-36 | Haute (7.5) | Acceptation de chemins absolus non vérifiés |
| CAPEC-139 | Relative Path Traversal | CWE-23 | Haute (7.5) | idem, chemins relatifs |
| CAPEC-193 | PHP Remote File Inclusion (RFI) | CWE-98 | Critique (9.8) | `include($_GET[...])`, `allow_url_include` avec input utilisateur |
| CAPEC-252 | PHP Local File Inclusion (LFI) | CWE-98 | Haute (8.6) | `include`/`require` avec chemin partiellement contrôlé |
| CAPEC-641 | DLL Side-Loading | CWE-427 | Haute | Chargement de bibliothèque depuis chemin de recherche non contrôlé |
| CAPEC-471 | Search Order Hijacking | CWE-427, CWE-426 | Haute | Résolution d'exécutable/module via PATH non canonique |
| CAPEC-38 | Leveraging/Manipulating Configuration File Search Paths | CWE-15 | Moyenne | Fichier de config chargé depuis chemin modifiable par l'utilisateur |

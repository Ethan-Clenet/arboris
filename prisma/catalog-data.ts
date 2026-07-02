// Données source du catalogue Arboris (utilisées uniquement par le seed).
// Transcrites depuis le prototype « Catalogue de skills IA ».

export interface CategorySeed {
  id: string
  labelFr: string
  labelEn: string
  color: string
  icon: string
}

export interface StackSeed {
  id: string
  label: string
  icon: string
  color: string
  briefFr: string
  briefEn: string
}

export interface SkillSeed {
  id: string
  cat: string
  icon: string
  score: number | null
  stacks: string[]
  tech: string[]
  compat: string[]
  tag: { fr: string; en: string }
  act: { fr: string; en: string }
  does: { fr: string[]; en: string[] }
  triggers: { fr: string[]; en: string[] }
}

export const CATEGORIES: CategorySeed[] = [
  { id: 'backend', labelFr: 'Backend & API', labelEn: 'Backend & API', color: '#4F8FF7', icon: 'lightning' },
  { id: 'runtime', labelFr: 'Runtime & Core', labelEn: 'Runtime & Core', color: '#3ECF8E', icon: 'cpu' },
  { id: 'language', labelFr: 'Langage & Types', labelEn: 'Language & Types', color: '#8B7FF7', icon: 'brackets-angle' },
  { id: 'security', labelFr: 'Auth & Sécurité', labelEn: 'Auth & Security', color: '#E5A53B', icon: 'shield-check' },
  { id: 'tooling', labelFr: 'Outils & Qualité', labelEn: 'Tooling & Quality', color: '#2DB8B0', icon: 'broom' },
  { id: 'docs', labelFr: 'Docs & Écriture', labelEn: 'Docs & Writing', color: '#F2789F', icon: 'book-open-text' },
  { id: 'git', labelFr: 'Git & Collaboration', labelEn: 'Git & Collaboration', color: '#F08A4B', icon: 'git-branch' },
  { id: 'agents', labelFr: 'Agents & Méta', labelEn: 'Agents & Meta', color: '#46C2E8', icon: 'magic-wand' },
  { id: 'dx', labelFr: 'Productivité & DX', labelEn: 'Productivity & DX', color: '#9BCB3C', icon: 'image' },
]

export const STACKS: StackSeed[] = [
  { id: 'node', label: 'Node.js', icon: 'hexagon', color: '#43A047', briefFr: 'Runtime JavaScript côté serveur', briefEn: 'Server-side JavaScript runtime' },
  { id: 'javascript', label: 'JavaScript', icon: 'file-js', color: '#E6B32E', briefFr: 'Le langage du web', briefEn: 'The language of the web' },
  { id: 'typescript', label: 'TypeScript', icon: 'file-ts', color: '#3178C6', briefFr: 'JavaScript typé', briefEn: 'Typed JavaScript' },
  { id: 'fastify', label: 'Fastify', icon: 'lightning', color: '#2DB8B0', briefFr: 'Framework web Node rapide', briefEn: 'Fast Node web framework' },
  { id: 'react', label: 'React', icon: 'atom', color: '#38BDF8', briefFr: 'UI par composants', briefEn: 'Component-based UI' },
  { id: 'angular', label: 'Angular', icon: 'shield', color: '#E5484D', briefFr: 'Framework front complet', briefEn: 'Full-featured front framework' },
  { id: 'next', label: 'Next.js', icon: 'triangle', color: '#7C6FF7', briefFr: 'React full-stack', briefEn: 'Full-stack React' },
]

const ALL_STACKS = ['node', 'javascript', 'typescript', 'react', 'angular', 'next']

export const SKILLS: SkillSeed[] = [
  {
    id: 'documentation',
    cat: 'docs',
    icon: 'book-open-text',
    score: 89,
    stacks: [...ALL_STACKS],
    tech: ['Diátaxis', 'Markdown', 'Docs'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Rédacteur technique qui structure la doc avec le cadre Diátaxis : tutoriels, how-to, référence, explication.',
      en: 'Technical writer that structures docs with the Diátaxis framework: tutorials, how-to, reference, explanation.',
    },
    act: {
      fr: 'structure la doc avec le cadre Diátaxis (tutoriels, how-to, référence, explication)',
      en: 'structure the docs with the Diátaxis framework (tutorials, how-to, reference, explanation)',
    },
    does: {
      fr: ['Choisit le bon type Diátaxis selon le besoin', 'Structure chaque page avec un gabarit clair', 'Garde un ton cohérent et orienté tâche', 'Vérifie la complétude avec une checklist'],
      en: ['Picks the right Diátaxis type for the need', 'Structures each page with a clear template', 'Keeps a consistent, task-oriented tone', 'Checks completeness with a checklist'],
    },
    triggers: {
      fr: ['Écris un tutoriel pour cette lib', 'Documente cette API', 'Réorganise notre documentation'],
      en: ['Write a tutorial for this lib', 'Document this API', 'Reorganize our documentation'],
    },
  },
  {
    id: 'fastify',
    cat: 'backend',
    icon: 'lightning',
    score: 100,
    stacks: ['node', 'typescript', 'fastify', 'next'],
    tech: ['Fastify', 'Node.js', 'TypeScript'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Bonnes pratiques Fastify : architecture en plugins, cycle des hooks, validation JSON-schema et perfs.',
      en: 'Fastify best practices: plugin architecture, hooks lifecycle, JSON-schema validation and performance.',
    },
    act: {
      fr: 'applique les bonnes pratiques Fastify — plugins, hooks, validation JSON-schema et logs Pino',
      en: 'apply Fastify best practices — plugins, hooks, JSON-schema validation and Pino logging',
    },
    does: {
      fr: ['Structure routes et plugins proprement', 'Valide entrées/sorties avec JSON Schema', 'Optimise les perfs (hooks, sérialisation)', 'Configure les logs avec Pino'],
      en: ['Structures routes and plugins cleanly', 'Validates I/O with JSON Schema', 'Tunes performance (hooks, serialization)', 'Sets up logging with Pino'],
    },
    triggers: {
      fr: ['Crée un serveur Fastify', 'Ajoute la validation de schéma', 'Optimise mon API Fastify'],
      en: ['Create a Fastify server', 'Add schema validation', 'Optimize my Fastify API'],
    },
  },
  {
    id: 'init',
    cat: 'agents',
    icon: 'compass',
    score: 96,
    stacks: [...ALL_STACKS],
    tech: ['AGENTS.md', 'Repo'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Crée et maintient un AGENTS.md à fort signal qui guide les agents dans ton dépôt.',
      en: 'Creates and maintains a high-signal AGENTS.md that guides agents across your repo.',
    },
    act: {
      fr: 'génère un AGENTS.md à fort signal décrivant comment les agents doivent travailler ici',
      en: 'generate a high-signal AGENTS.md describing how agents should work in this repo',
    },
    does: {
      fr: ['Analyse le dépôt et ses conventions', 'Rédige un AGENTS.md à fort signal', 'Documente commandes, structure et garde-fous', 'Maintient le fichier à jour'],
      en: ['Analyzes the repo and its conventions', 'Writes a high-signal AGENTS.md', 'Documents commands, structure and guardrails', 'Keeps the file up to date'],
    },
    triggers: {
      fr: ['Crée un AGENTS.md', 'Mets à jour les instructions agent', "Documente ce repo pour l'IA"],
      en: ['Create an AGENTS.md', 'Update the agent instructions', 'Document this repo for AI'],
    },
  },
  {
    id: 'linting-neostandard-eslint9',
    cat: 'tooling',
    icon: 'broom',
    score: 100,
    stacks: [...ALL_STACKS],
    tech: ['ESLint', 'neostandard', 'JavaScript'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Linting moderne sans le drame : neostandard et la config plate ESLint v9.',
      en: 'Modern linting without the drama: neostandard and the ESLint v9 flat config.',
    },
    act: {
      fr: 'configure le linting avec neostandard et une config plate ESLint v9',
      en: 'set up linting with neostandard and an ESLint v9 flat config',
    },
    does: {
      fr: ['Installe neostandard + ESLint v9', 'Génère une config plate eslint.config.js', 'Corrige les erreurs de lint courantes', 'Intègre le lint au workflow'],
      en: ['Installs neostandard + ESLint v9', 'Generates a flat eslint.config.js', 'Fixes common lint errors', 'Wires lint into the workflow'],
    },
    triggers: {
      fr: ['Configure ESLint', 'Mets en place le linting', 'Migre vers la config plate'],
      en: ['Set up ESLint', 'Configure linting', 'Migrate to flat config'],
    },
  },
  {
    id: 'node',
    cat: 'runtime',
    icon: 'hexagon',
    score: 100,
    stacks: ['node', 'typescript', 'fastify', 'next'],
    tech: ['Node.js', 'TypeScript', 'Streams'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Bonnes pratiques Node.js : event loop, erreurs async, streams, type stripping et test runner intégré.',
      en: 'Node.js best practices: event loop, async errors, streams, type stripping and the built-in test runner.',
    },
    act: {
      fr: 'applique les patterns Node.js modernes — event loop, erreurs async, streams et test runner intégré',
      en: 'apply modern Node.js patterns — event loop, async errors, streams and the built-in test runner',
    },
    does: {
      fr: ['Applique les patterns event loop & async', 'Gère erreurs et streams correctement', 'Utilise le type stripping (Node 22+)', 'Écrit des tests avec le runner intégré'],
      en: ['Applies event-loop & async patterns', 'Handles errors and streams correctly', 'Uses type stripping (Node 22+)', 'Writes tests with the built-in runner'],
    },
    triggers: {
      fr: ['Corrige cette fuite mémoire', 'Écris un test avec node:test', 'Refactore ce code async'],
      en: ['Fix this memory leak', 'Write a test with node:test', 'Refactor this async code'],
    },
  },
  {
    id: 'nodejs-core',
    cat: 'runtime',
    icon: 'cpu',
    score: 100,
    stacks: ['node'],
    tech: ['V8', 'libuv', 'C++'],
    compat: ['Claude', 'Cursor', 'Codex'],
    tag: {
      fr: 'Internes de Node.js au plus bas niveau : addons C++, V8, libuv et build systems.',
      en: 'Node.js internals at the lowest level: C++ addons, V8, libuv and build systems.',
    },
    act: {
      fr: 'aide-moi au niveau des internes de Node.js — addons C++, V8, libuv et build system',
      en: 'help me at the Node.js internals level — C++ addons, V8, libuv and the build system',
    },
    does: {
      fr: ["Explique V8, libuv et l'event loop en profondeur", 'Aide à écrire des addons C++ (N-API)', 'Diagnostique au niveau natif', 'Maîtrise le build system de Node'],
      en: ['Explains V8, libuv and the event loop deeply', 'Helps write C++ addons (N-API)', 'Diagnoses at the native level', 'Knows the Node build system'],
    },
    triggers: {
      fr: ['Écris un addon natif', 'Debug un crash V8', 'Explique ce comportement libuv'],
      en: ['Write a native addon', 'Debug a V8 crash', 'Explain this libuv behavior'],
    },
  },
  {
    id: 'oauth',
    cat: 'security',
    icon: 'shield-check',
    score: 100,
    stacks: ['node', 'typescript', 'fastify', 'next'],
    tech: ['OAuth 2.1', 'Fastify', 'RFC 6749'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: "Expert OAuth 2.0/2.1 (RFC 6749) avec patterns d'intégration Fastify et @fastify/oauth2.",
      en: 'OAuth 2.0/2.1 expert (RFC 6749) with Fastify and @fastify/oauth2 integration patterns.',
    },
    act: {
      fr: 'implémente OAuth 2.0/2.1 selon le RFC 6749 avec @fastify/oauth2',
      en: 'implement OAuth 2.0/2.1 per RFC 6749 with @fastify/oauth2',
    },
    does: {
      fr: ['Implémente OAuth 2.0/2.1 selon le RFC', 'Gère PKCE, refresh tokens et scopes', 'Intègre @fastify/oauth2', 'Évite les pièges de sécurité courants'],
      en: ['Implements OAuth 2.0/2.1 per the RFC', 'Handles PKCE, refresh tokens and scopes', 'Integrates @fastify/oauth2', 'Avoids common security pitfalls'],
    },
    triggers: {
      fr: ['Ajoute le login OAuth', 'Implémente PKCE', "Sécurise mon flux d'auth"],
      en: ['Add OAuth login', 'Implement PKCE', 'Secure my auth flow'],
    },
  },
  {
    id: 'octocat',
    cat: 'git',
    icon: 'git-branch',
    score: 96,
    stacks: [...ALL_STACKS],
    tech: ['Git', 'GitHub', 'gh CLI'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Magicien Git & GitHub via la CLI gh : PRs, issues, releases et gestion de dépôt.',
      en: 'Git & GitHub wizard via the gh CLI: PRs, issues, releases and repository management.',
    },
    act: {
      fr: 'gère toutes les opérations git et GitHub via la CLI gh (PRs, issues, releases)',
      en: 'drive all git and GitHub operations through the gh CLI (PRs, issues, releases)',
    },
    does: {
      fr: ['Pilote git/GitHub via la CLI gh', 'Crée PRs, issues et releases', 'Gère branches et reviews', 'Automatise les tâches de dépôt'],
      en: ['Drives git/GitHub via the gh CLI', 'Creates PRs, issues and releases', 'Manages branches and reviews', 'Automates repo chores'],
    },
    triggers: {
      fr: ['Ouvre une PR', 'Crée une release', 'Trie ces issues'],
      en: ['Open a PR', 'Cut a release', 'Triage these issues'],
    },
  },
  {
    id: 'skill-optimizer',
    cat: 'agents',
    icon: 'magic-wand',
    score: null,
    stacks: [...ALL_STACKS],
    tech: ['Agent Skills', 'Meta'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: "Améliore l'activation, les résultats de benchmark et la robustesse de tes skills.",
      en: 'Improves skill activation, benchmark outcomes and regression resistance across models.',
    },
    act: {
      fr: 'analyse et optimise mes skills pour une meilleure activation et robustesse',
      en: 'review and optimize my skills for better activation and regression resistance',
    },
    does: {
      fr: ["Analyse l'activation de tes skills", 'Améliore descriptions et déclencheurs', 'Renforce la robustesse entre modèles', 'Mesure les résultats de benchmark'],
      en: ['Analyzes how your skills activate', 'Improves descriptions and triggers', 'Hardens cross-model robustness', 'Measures benchmark outcomes'],
    },
    triggers: {
      fr: ['Optimise ce skill', "Améliore l'activation", 'Fais une revue de mes skills'],
      en: ['Optimize this skill', 'Improve activation', 'Review my skills'],
    },
  },
  {
    id: 'snipgrapher',
    cat: 'dx',
    icon: 'image',
    score: 100,
    stacks: [...ALL_STACKS],
    tech: ['CLI', 'Images', 'DX'],
    compat: ['Claude', 'Cursor', 'Codex'],
    tag: {
      fr: 'Configure et utilise snipgrapher pour générer des images de snippets de code soignées.',
      en: 'Configure and use snipgrapher to generate polished code-snippet images.',
    },
    act: {
      fr: 'configure snipgrapher et génère des images de snippets de code soignées',
      en: 'set up snipgrapher and generate polished code-snippet images',
    },
    does: {
      fr: ['Configure snipgrapher', 'Génère des images de snippets soignées', 'Personnalise thème et mise en page', 'Exporte pour docs et réseaux'],
      en: ['Sets up snipgrapher', 'Generates polished snippet images', 'Customizes theme and layout', 'Exports for docs and socials'],
    },
    triggers: {
      fr: ['Crée une image de ce code', 'Génère un carrousel de snippets', 'Mets en image cette fonction'],
      en: ['Make an image of this code', 'Generate a snippet carousel', 'Turn this function into an image'],
    },
  },
  {
    id: 'typescript-magician',
    cat: 'language',
    icon: 'brackets-angle',
    score: 100,
    stacks: ['typescript', 'node', 'react', 'angular', 'next', 'fastify'],
    tech: ['TypeScript', 'Generics', 'Types'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Magicien TypeScript : systèmes de types avancés, génériques complexes et zéro any.',
      en: 'TypeScript wizard: advanced type systems, complex generics and zero any.',
    },
    act: {
      fr: 'améliore mon TypeScript — types avancés, génériques complexes et suppression des any',
      en: 'level up my TypeScript — advanced types, complex generics and removing any',
    },
    does: {
      fr: ['Conçoit des types avancés et génériques', 'Élimine les any progressivement', 'Crée des utilitaires de types', 'Renforce la sûreté de types'],
      en: ['Designs advanced types and generics', 'Eliminates any incrementally', 'Builds type utilities', 'Strengthens type safety'],
    },
    triggers: {
      fr: ['Type cette fonction générique', 'Supprime les any ici', 'Crée un type utilitaire'],
      en: ['Type this generic function', 'Remove the anys here', 'Create a utility type'],
    },
  },
  {
    id: 'accessibility',
    cat: 'dx',
    icon: 'wheelchair',
    score: 98,
    stacks: ['javascript', 'typescript', 'react', 'angular', 'next'],
    tech: ['WCAG 2.2', 'WAI-ARIA', 'a11y'],
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    tag: {
      fr: 'Conçoit, implémente et audite des interfaces inclusives selon WCAG 2.2 AA — ARIA (Web), traits et labels (iOS/Android).',
      en: 'Design, implement, and audit inclusive interfaces using WCAG 2.2 AA — semantic ARIA (Web) and accessibility traits (iOS/Android).',
    },
    act: {
      fr: 'applique les bonnes pratiques WCAG 2.2 (POUR, ARIA, focus, contrastes, cibles tactiles)',
      en: 'apply WCAG 2.2 best practices (POUR, ARIA, focus, contrast, target sizes)',
    },
    does: {
      fr: [
        'Identifie le rôle sémantique des composants (bouton, lien, onglet)',
        'Assure contraste 4.5:1, alternatives textuelles et reflow jusqu’à 400 %',
        'Implémente cibles 24×24 px, focus visible et alternatives au drag',
        'Fournit des messages d’erreur descriptifs et une logique compréhensible',
        'Vérifie Name/Role/Value et les régions live pour les mises à jour dynamiques',
      ],
      en: [
        'Identifies semantic component roles (button, link, tab)',
        'Ensures 4.5:1 contrast, text alternatives, and reflow up to 400% zoom',
        'Implements 24×24 px targets, visible focus, and drag alternatives',
        'Provides descriptive error messages and understandable logic',
        'Verifies Name/Role/Value and live regions for dynamic updates',
      ],
    },
    triggers: {
      fr: [
        'Audite l’accessibilité de cette page',
        'Rends ce composant conforme WCAG',
        'Ajoute les labels ARIA manquants',
      ],
      en: [
        'Audit this page for accessibility',
        'Make this component WCAG compliant',
        'Add missing ARIA labels',
      ],
    },
  },
]

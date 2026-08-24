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
  securityRecommendation?: string | null
  securityReportJson?: string | null
  scannedAt?: string | null
  scanMode?: string | null
  /** Éditeur / auteur (metadata.origin), ex. ECC. */
  publisher?: string | null
  stacks: string[]
  tech: string[]
  compat: string[]
  tag: { fr: string; en: string }
  act: { fr: string; en: string }
  does: { fr: string[]; en: string[] }
  triggers: { fr: string[]; en: string[] }
  /** Contenu Markdown brut (SKILL.md), optionnel. */
  bodyMd?: string | null
}

export const CATEGORIES: CategorySeed[] = [
  { id: 'agents', labelFr: 'Agents & Orchestration', labelEn: 'Agents & Orchestration', color: '#46C2E8', icon: 'magic-wand' },
  { id: 'frontend', labelFr: 'Frontend & UI', labelEn: 'Frontend & UI', color: '#38BDF8', icon: 'atom' },
  { id: 'backend', labelFr: 'Backend & API', labelEn: 'Backend & API', color: '#4F8FF7', icon: 'lightning' },
  { id: 'language', labelFr: 'Langages & Runtimes', labelEn: 'Languages & Runtimes', color: '#8B7FF7', icon: 'brackets-angle' },
  { id: 'tests', labelFr: 'Tests', labelEn: 'Testing', color: '#2DB8B0', icon: 'flask' },
  { id: 'verification', labelFr: 'Vérification', labelEn: 'Verification', color: '#0D9488', icon: 'seal-check' },
  { id: 'security', labelFr: 'Auth & Sécurité', labelEn: 'Auth & Security', color: '#E5A53B', icon: 'shield-check' },
  { id: 'data', labelFr: 'Données & Recherche', labelEn: 'Data & Research', color: '#9BCB3C', icon: 'database' },
  { id: 'ops', labelFr: 'Infra, Ops & Workflow', labelEn: 'Infra, Ops & Workflow', color: '#F08A4B', icon: 'git-branch' },
  { id: 'docs', labelFr: 'Docs & Écriture', labelEn: 'Docs & Writing', color: '#F2789F', icon: 'book-open-text' },
  { id: 'product', labelFr: 'Produit & Go-to-market', labelEn: 'Product & Go-to-market', color: '#E5484D', icon: 'image' },
]

export const STACKS: StackSeed[] = [
  { id: 'node', label: 'Node.js', icon: 'hexagon', color: '#43A047', briefFr: 'Runtime JavaScript côté serveur', briefEn: 'Server-side JavaScript runtime' },
  { id: 'js', label: 'JavaScript', icon: 'file-js', color: '#E6B32E', briefFr: 'Le langage du web', briefEn: 'The language of the web' },
  { id: 'ts', label: 'TypeScript', icon: 'file-ts', color: '#3178C6', briefFr: 'JavaScript typé', briefEn: 'Typed JavaScript' },
  { id: 'fastapi', label: 'FastAPI', icon: 'lightning', color: '#009688', briefFr: 'Framework API Python moderne', briefEn: 'Modern Python API framework' },
  { id: 'react', label: 'React', icon: 'atom', color: '#38BDF8', briefFr: 'UI par composants', briefEn: 'Component-based UI' },
  { id: 'angular', label: 'Angular', icon: 'shield', color: '#E5484D', briefFr: 'Framework front complet', briefEn: 'Full-featured front framework' },
  { id: 'java', label: 'Java', icon: 'coffee', color: '#E76F00', briefFr: 'Écosystème entreprise et JVM', briefEn: 'Enterprise and JVM ecosystem' },
  { id: 'spring-boot', label: 'Spring Boot', icon: 'leaf', color: '#6DB33F', briefFr: 'Framework backend Java', briefEn: 'Java backend framework' },
  { id: 'docker', label: 'Docker', icon: 'shipping-container', color: '#2496ED', briefFr: 'Conteneurisation applicative', briefEn: 'Application containerization' },
  { id: 'n8n', label: 'n8n', icon: 'share-network', color: '#EA4B71', briefFr: 'Automatisation de workflows self-host', briefEn: 'Self-hosted workflow automation' },
  { id: 'k9', label: 'K9', icon: 'cube', color: '#326CE5', briefFr: 'Ops Kubernetes et navigation cluster', briefEn: 'Kubernetes ops and cluster navigation' },
  { id: 'postgresql', label: 'PostgreSQL', icon: 'database', color: '#336791', briefFr: 'Base de données relationnelle avancée', briefEn: 'Advanced relational database' },
  { id: 'mysql', label: 'MySQL', icon: 'database', color: '#4479A1', briefFr: 'Base de données relationnelle populaire', briefEn: 'Popular relational database' },
  { id: 'prisma', label: 'Prisma', icon: 'diamonds-four', color: '#2D3748', briefFr: 'ORM moderne pour TypeScript', briefEn: 'Modern ORM for TypeScript' },
  { id: 'supabase', label: 'Supabase', icon: 'database', color: '#3ECF8E', briefFr: 'Backend Postgres avec auth, storage et edge functions', briefEn: 'Postgres backend with auth, storage, and edge functions' },
  { id: 'firebase', label: 'Firebase', icon: 'flame', color: '#FFCA28', briefFr: 'Plateforme Google pour auth, Firestore et hosting', briefEn: 'Google platform for auth, Firestore, and hosting' },
  { id: 'convex', label: 'Convex', icon: 'hexagon', color: '#FF5C35', briefFr: 'Backend réactif TypeScript avec base de données intégrée', briefEn: 'Reactive TypeScript backend with built-in database' },
  { id: 'neon', label: 'Neon', icon: 'database', color: '#00E599', briefFr: 'Postgres serverless avec branching', briefEn: 'Serverless Postgres with branching' },
  { id: 'turso', label: 'Turso', icon: 'database', color: '#4FF8D2', briefFr: 'SQLite distribué compatible edge', briefEn: 'Distributed SQLite for the edge' },
  { id: 'duckdb', label: 'DuckDB', icon: 'database', color: '#FFF000', briefFr: 'Moteur analytique SQL embarqué', briefEn: 'Embedded analytical SQL engine' },
  { id: 'drizzle', label: 'Drizzle ORM', icon: 'diamonds-four', color: '#C5F74F', briefFr: 'ORM TypeScript type-safe sans runtime', briefEn: 'Type-safe TypeScript ORM with zero runtime' },
]

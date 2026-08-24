// Mapping SkillSpector → modèle Arboris (isomorphe : client + serveur).

export type SecurityRecommendation = 'SAFE' | 'CAUTION' | 'UNSAFE' | 'UNKNOWN'

export type SkillSpectorIssue = {
  id: string
  category: string
  pattern: string
  severity: string
  confidence?: number
  finding?: string
  explanation?: string
  remediation?: string
  location?: { file?: string; start_line?: number | null }
}

export type SkillSecurityReport = {
  riskScore: number
  severity: string
  recommendation: SecurityRecommendation
  issueCount: number
  issues: SkillSpectorIssue[]
  scannedAt: string
  scanMode: 'static' | 'semantic'
  skillName?: string
  /** Hash du dossier skill au moment du scan (skip si inchangé). */
  contentHash?: string
  /** Version SkillSpector utilisée (rescan si le pin change). */
  scannerVersion?: string
}

/** Seuil sous lequel l’install affiche un avertissement fort (sûreté). */
export const SECURITY_WARN_SCORE = 70
/** Seuil sous lequel l’install exige une confirmation explicite. */
export const SECURITY_CONFIRM_SCORE = 50

export function normalizeRecommendation(raw: string | null | undefined): SecurityRecommendation {
  const value = (raw ?? '').trim().toUpperCase()
  if (value === 'SAFE' || value === 'ALLOW' || value === 'PASS') return 'SAFE'
  if (value === 'CAUTION' || value === 'WARN' || value === 'WARNING') return 'CAUTION'
  if (value === 'UNSAFE' || value === 'BLOCK' || value === 'FAIL' || value === 'DANGEROUS' || value === 'DO_NOT_INSTALL') return 'UNSAFE'
  return 'UNKNOWN'
}

/** Convertit le risk score SkillSpector (élevé = dangereux) en score de sûreté Arboris. */
export function riskToSafetyScore(riskScore: number): number {
  const risk = Number.isFinite(riskScore) ? Math.round(riskScore) : 0
  return Math.max(0, Math.min(100, 100 - risk))
}

export function safetyLevel(score: number | null | undefined): SecurityRecommendation {
  if (score == null) return 'UNKNOWN'
  if (score >= SECURITY_WARN_SCORE) return 'SAFE'
  if (score >= SECURITY_CONFIRM_SCORE) return 'CAUTION'
  return 'UNSAFE'
}

export function parseSecurityReport(json: string | null | undefined): SkillSecurityReport | null {
  if (!json || json === 'null') return null
  try {
    const value = JSON.parse(json) as SkillSecurityReport
    if (!value || typeof value !== 'object') return null
    return {
      ...value,
      recommendation: normalizeRecommendation(value.recommendation),
      issues: Array.isArray(value.issues) ? value.issues : [],
    }
  } catch {
    return null
  }
}

/** Normalise un rapport brut `skillspector --format json`. */
export function mapSkillspectorJson(
  raw: unknown,
  scanMode: 'static' | 'semantic' = 'static',
): SkillSecurityReport | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const risk = data.risk_assessment as Record<string, unknown> | undefined
  const skill = data.skill as Record<string, unknown> | undefined
  if (!risk || typeof risk.score !== 'number') return null

  const issuesRaw = Array.isArray(data.issues) ? data.issues : []
  const issues: SkillSpectorIssue[] = issuesRaw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      id: String(item.id ?? ''),
      category: String(item.category ?? ''),
      pattern: String(item.pattern ?? ''),
      severity: String(item.severity ?? ''),
      confidence: typeof item.confidence === 'number' ? item.confidence : undefined,
      finding: typeof item.finding === 'string' ? item.finding : undefined,
      explanation: typeof item.explanation === 'string' ? item.explanation : undefined,
      remediation: typeof item.remediation === 'string' ? item.remediation : undefined,
      location:
        item.location && typeof item.location === 'object'
          ? {
              file: typeof (item.location as { file?: unknown }).file === 'string'
                ? (item.location as { file: string }).file
                : undefined,
              start_line:
                typeof (item.location as { start_line?: unknown }).start_line === 'number'
                  ? (item.location as { start_line: number }).start_line
                  : null,
            }
          : undefined,
    }))

  return {
    riskScore: risk.score,
    severity: String(risk.severity ?? 'UNKNOWN'),
    recommendation: normalizeRecommendation(String(risk.recommendation ?? '')),
    issueCount: issues.length,
    issues: issues.slice(0, 25),
    scannedAt: typeof skill?.scanned_at === 'string' ? skill.scanned_at : new Date().toISOString(),
    scanMode,
    skillName: typeof skill?.name === 'string' ? skill.name : undefined,
  }
}

export function needsInstallConfirm(score: number | null | undefined): boolean {
  return score != null && score < SECURITY_CONFIRM_SCORE
}

export function needsInstallWarning(score: number | null | undefined): boolean {
  return score != null && score < SECURITY_WARN_SCORE
}

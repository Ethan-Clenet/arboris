import { describe, expect, it } from 'vitest'
import {
  mapSkillspectorJson,
  needsInstallConfirm,
  needsInstallWarning,
  normalizeRecommendation,
  parseSecurityReport,
  riskToSafetyScore,
  safetyLevel,
} from './skillspector'

describe('normalizeRecommendation', () => {
  it.each([
    ['SAFE', 'SAFE'],
    ['allow', 'SAFE'],
    ['WARN', 'CAUTION'],
    ['BLOCK', 'UNSAFE'],
    ['nope', 'UNKNOWN'],
    [null, 'UNKNOWN'],
  ] as const)('%s → %s', (raw, expected) => {
    expect(normalizeRecommendation(raw)).toBe(expected)
  })
})

describe('riskToSafetyScore', () => {
  it('inverse le risk SkillSpector', () => {
    expect(riskToSafetyScore(0)).toBe(100)
    expect(riskToSafetyScore(30)).toBe(70)
    expect(riskToSafetyScore(100)).toBe(0)
  })

  it('borne les valeurs hors plage', () => {
    expect(riskToSafetyScore(200)).toBe(0)
    expect(riskToSafetyScore(-5)).toBe(100)
    expect(riskToSafetyScore(Number.NaN)).toBe(100)
  })
})

describe('safetyLevel', () => {
  it('classe selon les seuils', () => {
    expect(safetyLevel(null)).toBe('UNKNOWN')
    expect(safetyLevel(90)).toBe('SAFE')
    expect(safetyLevel(60)).toBe('CAUTION')
    expect(safetyLevel(20)).toBe('UNSAFE')
  })
})

describe('parseSecurityReport', () => {
  it('ignore vide et JSON invalide', () => {
    expect(parseSecurityReport(null)).toBeNull()
    expect(parseSecurityReport('null')).toBeNull()
    expect(parseSecurityReport('{')).toBeNull()
  })

  it('normalise recommendation et issues', () => {
    const report = parseSecurityReport(
      JSON.stringify({ riskScore: 10, recommendation: 'allow', issues: 'bad' }),
    )
    expect(report?.recommendation).toBe('SAFE')
    expect(report?.issues).toEqual([])
  })
})

describe('mapSkillspectorJson', () => {
  it('mappe un rapport brut', () => {
    const mapped = mapSkillspectorJson(
      {
        risk_assessment: { score: 12, severity: 'LOW', recommendation: 'PASS' },
        skill: { name: 'gateguard', scanned_at: '2026-01-01T00:00:00.000Z' },
        issues: [
          {
            id: 'i1',
            category: 'net',
            pattern: 'curl',
            severity: 'LOW',
            location: { file: 'SKILL.md', start_line: 4 },
          },
        ],
      },
      'static',
    )
    expect(mapped).toMatchObject({
      riskScore: 12,
      recommendation: 'SAFE',
      issueCount: 1,
      skillName: 'gateguard',
      scanMode: 'static',
    })
    expect(mapped?.issues[0]?.location).toEqual({ file: 'SKILL.md', start_line: 4 })
  })

  it('rejette un payload incomplet', () => {
    expect(mapSkillspectorJson({})).toBeNull()
    expect(mapSkillspectorJson(null)).toBeNull()
  })
})

describe('needsInstall*', () => {
  it('avertit sous 70 et confirme sous 50', () => {
    expect(needsInstallWarning(80)).toBe(false)
    expect(needsInstallWarning(60)).toBe(true)
    expect(needsInstallConfirm(60)).toBe(false)
    expect(needsInstallConfirm(40)).toBe(true)
    expect(needsInstallConfirm(null)).toBe(false)
  })
})

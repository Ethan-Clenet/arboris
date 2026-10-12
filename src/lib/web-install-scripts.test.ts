import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '../..')

describe('installateurs web publics', () => {
  it.each(['collection', 'skill', 'command'] as const)(
    'install-%s.mjs refuse un appel sans id et vise le bon ZIP',
    (kind) => {
      const file = join(ROOT, 'public/cli', `install-${kind}.mjs`)
      const src = readFileSync(file, 'utf8')
      expect(src).toContain(`const ZIP_SEGMENT = '${kind}-zip'`)
      expect(src).toContain('--agent=')
      expect(src).not.toContain('npx --yes https://')

      const ran = spawnSync(process.execPath, [file], { encoding: 'utf8' })
      expect(ran.status).toBe(1)
      expect(ran.stderr).toMatch(/Usage:/)
    },
  )
})

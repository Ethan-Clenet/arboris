import { describe, expect, it } from 'vitest'
import { resolveAllCommands, resolveCommand } from './commands.server'

describe('resolveAllCommands / resolveCommand', () => {
  it('sert le bundle embarqué', async () => {
    const all = await resolveAllCommands()
    expect(all.length).toBeGreaterThan(0)
    const first = all[0]!
    expect(await resolveCommand(first.id)).toMatchObject({ id: first.id })
    expect(await resolveCommand('__missing__')).toBeNull()
  })
})

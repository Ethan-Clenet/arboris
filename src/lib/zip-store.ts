/**
 * ZIP « store » (sans compression) — suffisant pour des .md de skills/commands.
 * Évite une dépendance lourde juste pour le téléchargement cloud.
 */
function crc32(buf: Uint8Array): number {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]!
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return ~c >>> 0
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2)
  new DataView(b.buffer).setUint16(0, n, true)
  return b
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setUint32(0, n >>> 0, true)
  return b
}

function concat(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((a, p) => a + p.length, 0)
  const out = new Uint8Array(len)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

export type ZipEntry = { path: string; content: string | Uint8Array }

/** Construit un .zip non compressé (method 0). */
export function buildStoreZip(entries: ZipEntry[]): Uint8Array {
  const enc = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const name = enc.encode(entry.path.replace(/\\/g, '/'))
    const data = typeof entry.content === 'string' ? enc.encode(entry.content) : entry.content
    const crc = crc32(data)
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ])
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }

  const centralDir = concat(centrals)
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ])

  return concat([...locals, centralDir, end])
}

export function zipToBase64(zip: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(zip).toString('base64')
  let s = ''
  for (let i = 0; i < zip.length; i++) s += String.fromCharCode(zip[i]!)
  return btoa(s)
}

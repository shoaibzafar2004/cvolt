/**
 * Downloads every file in the hosted Supabase `pdfs` bucket into supabase/backup/storage/pdfs/.
 * Reads the cloud URL + service role key from .env.local.cloud.bak.
 * Run: node scripts/export-cloud-storage.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const env = Object.fromEntries(
  readFileSync('.env.local.cloud.bak', 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const bucket = 'pdfs'
const outDir = join('supabase', 'backup', 'storage', bucket)
const headers = { apikey: key, Authorization: `Bearer ${key}` }

async function list(prefix) {
  const res = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  })
  if (!res.ok) throw new Error(`list ${prefix}: ${res.status} ${await res.text()}`)
  const files = []
  for (const item of await res.json()) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id === null) files.push(...(await list(path)))
    else if (item.name !== '.emptyFolderPlaceholder') files.push(path)
  }
  return files
}

const files = await list('')
for (const path of files) {
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, { headers })
  if (!res.ok) {
    console.error(`FAILED ${path}: ${res.status}`)
    continue
  }
  const dest = join(outDir, path)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  console.log(`saved ${dest}`)
}
console.log(`Done: ${files.length} files`)

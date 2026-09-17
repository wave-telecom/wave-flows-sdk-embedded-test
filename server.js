// Servidor estático sem dependências — o equivalente em Node do
// `python -m http.server`, servindo ./public.
//
// Porta 8080 por padrão, de propósito diferente da do frame (3000): é o que
// exercita `frame-ancestors` e a validação de `event.origin` no host.
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, 'public')
const PORT = Number(process.env.PORT) || 8080
const HOST = process.env.HOST || '0.0.0.0'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', ...headers })
  res.end(body)
}

async function resolveFile(pathname) {
  // normalize + a checagem de prefixo cortam `../` antes de virar leitura
  // fora de ./public.
  const decoded = decodeURIComponent(pathname.split('?')[0])
  const target = normalize(join(ROOT, decoded))
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null

  try {
    const info = await stat(target)
    if (info.isDirectory()) {
      const index = join(target, 'index.html')
      await stat(index)
      return index
    }
    return target
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { allow: 'GET, HEAD' })
  }

  const url = new URL(req.url, 'http://localhost')
  const file = await resolveFile(url.pathname)

  if (!file) {
    console.log(`${req.method} ${url.pathname} -> 404`)
    return send(res, 404, 'Not Found')
  }

  console.log(`${req.method} ${url.pathname} -> 200`)

  res.writeHead(200, {
    'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
    // Página de teste: nunca queremos uma versão velha em cache.
    'cache-control': 'no-store',
  })

  if (req.method === 'HEAD') return res.end()
  createReadStream(file).pipe(res)
})

server.listen(PORT, HOST, () => {
  console.log(`sdk-embedded servindo ./public em http://localhost:${PORT}`)
})

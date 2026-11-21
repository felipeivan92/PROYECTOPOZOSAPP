import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { Readable } from 'node:stream';
import { crearApi } from './gestion.mjs';

const base = new DatabaseSync(process.env.AQUA_DB_FILE || 'aqua-local.sqlite');
base.exec(readFileSync(new URL('./datos.sql', import.meta.url), 'utf8'));
const gestionar = crearApi((sql, parametros) => base.prepare(sql).all(...parametros));

const archivos = new Map([
  ['/', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/decisiones.js', ['decisiones.js', 'text/javascript']],
  ['/estilo.css', ['estilo.css', 'text/css']]
]);

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/api/gestion') {
    const options = { method: req.method, headers: req.headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = Readable.toWeb(req);
      options.duplex = 'half';
    }
    const respuesta = await gestionar(new Request(url, options));
    res.writeHead(respuesta.status, Object.fromEntries(respuesta.headers));
    return res.end(await respuesta.text());
  }

  const archivo = archivos.get(url.pathname);
  if (!archivo) {
    res.writeHead(404);
    return res.end();
  }
  const [nombre, tipo] = archivo;
  res.writeHead(200, { 'Content-Type': tipo + '; charset=utf-8' });
  res.end(readFileSync(new URL('./public/' + nombre, import.meta.url)));
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, '127.0.0.1', () => {
  console.log('Aqua Trace · http://127.0.0.1:' + server.address().port);
});

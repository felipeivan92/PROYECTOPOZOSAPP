import { crearApi } from '../src/gestion.mjs';

async function ejecutar(sql, parametros) {
  const url = new URL(process.env.TURSO_DATABASE_URL.replace(/^libsql:/, 'https:'));
  if (url.protocol !== 'https:' || !process.env.TURSO_AUTH_TOKEN) throw new Error('Falta configurar Turso');
  const resp = await fetch(new URL('/v2/pipeline', url), {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.TURSO_AUTH_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: parametros.map(value => ({
              type: typeof value === 'number' ? 'integer' : 'text',
              value: String(value)
            })),
            want_rows: true
          }
        },
        { type: 'close' }
      ]
    }),
    signal: AbortSignal.timeout(5000)
  });
  if (!resp.ok) throw new Error('Turso no respondió correctamente');
  const { results } = await resp.json();
  const operacion = results?.[0];
  if (operacion?.type !== 'ok') throw new Error('Falló la consulta');
  const { cols, rows } = operacion.response.result;
  return rows.map(row => Object.fromEntries(cols.map(({ name }, index) => {
    const field = row[index];
    return [name, field.type === 'integer' ? Number(field.value) : field.value];
  })));
}

export default { fetch: crearApi(ejecutar) };

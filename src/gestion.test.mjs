import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { crearApi } from './gestion.mjs';

const esquema = readFileSync(new URL('./datos.sql', import.meta.url), 'utf8');
const leer = 'SELECT folio, id_evento, accion, resultado, comentario FROM gestion';

function enviar(gestionar, datos) {
  return gestionar(new Request('http://localhost/api/gestion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  }));
}

test('guarda una gestión real, admite reintento y rechaza tres solicitudes inválidas', async t => {
  const directorio = mkdtempSync(join(tmpdir(), 'aqua-test-'));
  const ruta = join(directorio, 'demo.sqlite');
  const base = new DatabaseSync(ruta);
  t.after(() => rmSync(directorio, { recursive: true, force: true }));
  base.exec(esquema);

  const gestionar = crearApi((sql, parametros) => base.prepare(sql).all(...parametros));
  const datos = {
    folio: randomUUID(), id_evento: 7001, accion: 'Validar evento',
    resultado: 'Sin ticket', comentario: 'Revisé la lectura de ejemplo'
  };

  try {
    const primera = await enviar(gestionar, datos);
    assert.equal(primera.status, 201);
    const { gestion } = await primera.json();
    assert.equal(gestion.folio, datos.folio);
    assert.equal(gestion.id_evento, 7001);
    assert.ok(gestion.fecha_hora);

    const reintento = await enviar(gestionar, datos);
    assert.equal(reintento.status, 200);
    assert.deepEqual((await reintento.json()).gestion, gestion);
    assert.equal((await enviar(gestionar, { ...datos, comentario: 'Otra solicitud' })).status, 409);

    const vacio = await enviar(gestionar, { ...datos, folio: randomUUID(), comentario: '  ' });
    assert.equal(vacio.status, 422);
    assert.deepEqual(await vacio.json(), { campo: 'comentario', mensaje: 'Escribe por qué tomaste esta decisión.' });

    const insuficiente = await enviar(gestionar, { ...datos, folio: randomUUID(), id_evento: 7002 });
    assert.equal(insuficiente.status, 409);
    assert.match((await insuficiente.json()).mensaje, /antecedentes adicionales/);

    const parInvalido = await enviar(gestionar, { ...datos, folio: randomUUID(), resultado: 'Evento descartado' });
    assert.equal(parInvalido.status, 422);
  } finally {
    base.close();
  }

  const verificacion = new DatabaseSync(ruta, { readOnly: true });
  try {
    assert.deepEqual(verificacion.prepare(leer).all().map(row => ({ ...row })), [datos]);
  } finally {
    verificacion.close();
  }
});

test('si la base falla, responde sin confirmar un folio guardado', async () => {
  const gestionar = crearApi(() => { throw new Error('Falla simulada de conexión'); });
  const resp = await enviar(gestionar, {
    folio: randomUUID(), id_evento: 7001,
    accion: 'Validar evento', resultado: 'Sin ticket', comentario: 'Ejemplo'
  });
  assert.equal(resp.status, 503);
  assert.match((await resp.json()).mensaje, /confirmar el guardado/);
});

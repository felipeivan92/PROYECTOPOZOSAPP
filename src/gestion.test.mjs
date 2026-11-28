import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { autorizar, crearApi, validarCreacion, validarTransicion } from './gestion.mjs';

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

const base = {
  folio: '3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f', id_evento: 7001,
  accion: 'Validar evento', resultado: 'Sin ticket', comentario: 'Revisé la lectura de ejemplo'
};

function contar(ruta) {
  const lectura = new DatabaseSync(ruta, { readOnly: true });
  try {
    return lectura.prepare('SELECT COUNT(*) AS total FROM gestion').get().total;
  } finally {
    lectura.close();
  }
}

test('robustez 1 y 3: comentario vacío o de más de 300 caracteres se rechaza en el servidor y no guarda nada', async t => {
  const directorio = mkdtempSync(join(tmpdir(), 'aqua-test-'));
  const ruta = join(directorio, 'robustez.sqlite');
  const db = new DatabaseSync(ruta);
  t.after(() => rmSync(directorio, { recursive: true, force: true }));
  db.exec(esquema);
  const gestionar = crearApi((sql, parametros) => db.prepare(sql).all(...parametros));

  try {
    for (const comentario of ['', '   ', undefined]) {
      const resp = await enviar(gestionar, { ...base, comentario });
      assert.equal(resp.status, 422);
      assert.deepEqual(await resp.json(), { campo: 'comentario', mensaje: 'Escribe por qué tomaste esta decisión.' });
    }
    const limite = await enviar(gestionar, { ...base, comentario: 'a'.repeat(300) });
    assert.equal(limite.status, 201);

    const largo = await enviar(gestionar, { ...base, folio: randomUUID(), comentario: 'a'.repeat(301) });
    assert.equal(largo.status, 422);
    assert.deepEqual(await largo.json(), { campo: 'comentario', mensaje: 'Usa un comentario válido de hasta 300 caracteres.' });
  } finally {
    db.close();
  }
  assert.equal(contar(ruta), 1);
});

test('robustez 2: dos envíos simultáneos con el mismo folio guardan una sola gestión', async t => {
  const directorio = mkdtempSync(join(tmpdir(), 'aqua-test-'));
  const ruta = join(directorio, 'doble.sqlite');
  const db = new DatabaseSync(ruta);
  t.after(() => rmSync(directorio, { recursive: true, force: true }));
  db.exec(esquema);
  const gestionar = crearApi((sql, parametros) => db.prepare(sql).all(...parametros));

  try {
    const [a, b] = await Promise.all([enviar(gestionar, base), enviar(gestionar, base)]);
    assert.deepEqual([a.status, b.status].sort(), [200, 201]);
  } finally {
    db.close();
  }
  assert.equal(contar(ruta), 1);
});

test('validarCreacion conserva los mensajes del Avance 7', () => {
  assert.equal(validarCreacion(base).ok, true);
  assert.equal(validarCreacion({ ...base, folio: 'no-es-uuid' }).mensaje, 'El evento o el folio de la solicitud no es válido.');
  assert.equal(validarCreacion({ ...base, id_evento: 0 }).mensaje, 'El evento o el folio de la solicitud no es válido.');
  assert.equal(validarCreacion({ ...base, accion: 'Otra' }).mensaje, 'Selecciona una acción y un resultado compatibles.');
  assert.equal(validarCreacion({ ...base, resultado: 'Evento descartado' }).mensaje, 'Selecciona una acción y un resultado compatibles.');
  assert.equal(validarCreacion({ ...base, comentario: 'hola\u0000' }).mensaje, 'Usa un comentario válido de hasta 300 caracteres.');
  assert.equal(validarCreacion(null).status, 422);
});

test('validarTransicion acepta solo las transiciones acordadas', () => {
  for (const [estadoActual, estadoNuevo] of [['Registrada', 'Cerrada'], ['Registrada', 'Anulada'], ['Cerrada', 'Anulada']]) {
    assert.equal(validarTransicion({ estadoActual, estadoNuevo, motivo: 'Dato duplicado' }).ok, true, estadoActual + ' a ' + estadoNuevo);
  }
  const invalidas = [
    ['Cerrada', 'Registrada'], ['Cerrada', 'Cerrada'], ['Registrada', 'Registrada'],
    ['Anulada', 'Registrada'], ['Anulada', 'Cerrada'], ['Anulada', 'Anulada'],
    ['Registrada', 'Eliminada'], ['Inexistente', 'Cerrada'], [undefined, undefined]
  ];
  for (const [estadoActual, estadoNuevo] of invalidas) {
    const r = validarTransicion({ estadoActual, estadoNuevo, motivo: 'Dato duplicado' });
    assert.equal(r.ok, false, String(estadoActual) + ' a ' + String(estadoNuevo));
    assert.equal(r.status, 409);
    assert.equal(r.mensaje, 'La transición de estado no está permitida.');
  }
});

test('toda anulación exige un motivo de 1 a 300 caracteres', () => {
  const anular = motivo => validarTransicion({ estadoActual: 'Registrada', estadoNuevo: 'Anulada', motivo });
  for (const motivo of [undefined, '', '   ', 7]) {
    assert.deepEqual(anular(motivo), { ok: false, status: 422, campo: 'motivo_anulacion', mensaje: 'Escribe el motivo de la anulación.' });
  }
  assert.equal(anular('a'.repeat(301)).mensaje, 'Usa un motivo válido de hasta 300 caracteres.');
  assert.deepEqual(anular(' Dato duplicado ').valores, { estado: 'Anulada', motivo_anulacion: 'Dato duplicado' });
  assert.equal(anular('a'.repeat(300)).ok, true);
  assert.equal(validarTransicion({ estadoActual: 'Registrada', estadoNuevo: 'Cerrada' }).ok, true);
});

test('la matriz de permisos por rol coincide con docs/permisos.md', () => {
  const esperado = {
    Analista: { crear: true, consultar: true, actualizar: false, anular: false },
    Supervisor: { crear: false, consultar: true, actualizar: true, anular: true },
    Administrador: { crear: false, consultar: false, actualizar: false, anular: false }
  };
  for (const [rol, operaciones] of Object.entries(esperado)) {
    for (const [operacion, permitido] of Object.entries(operaciones)) {
      assert.equal(autorizar(rol, operacion), permitido, rol + ' ' + operacion);
    }
  }
  for (const rol of [null, undefined, '', 'Invitado']) {
    for (const operacion of ['crear', 'consultar', 'actualizar', 'anular', 'eliminar']) {
      assert.equal(autorizar(rol, operacion), false);
    }
  }
  assert.equal(autorizar('Supervisor', 'eliminar'), false);
});

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { crearApiRest } from './gestion-rest.mjs';

// Supabase simulado. Imita lo que la base debe hacer según db/001_esquema_inicial.sql:
// asigna id_usuario, estado inicial, fecha_hora y auditoría; aplica RLS por rol,
// los CHECK de la tabla y rechaza columnas que el rol no puede escribir.
const COLUMNAS_INSERT = ['folio', 'id_evento', 'accion', 'resultado', 'comentario'];
const COLUMNAS_UPDATE = ['estado', 'motivo_anulacion'];

function crearEntorno() {
  const usuarios = {
    'token-ana': { id: 'u-ana', rol: 'Analista' },
    'token-beto': { id: 'u-beto', rol: 'Analista' },
    'token-sup': { id: 'u-sup', rol: 'Supervisor' },
    'token-adm': { id: 'u-adm', rol: 'Administrador' }
  };
  const eventos = [
    { id_evento: 7001, respaldo_suficiente: true },
    { id_evento: 7002, respaldo_suficiente: false }
  ];
  const entorno = { gestiones: [], llamadas: [], sinConexion: false, antesDeActualizar: null, fugaRls: false };

  const coincide = (fila, parametros) => Object.entries(parametros).every(([clave, valor]) =>
    ['select', 'order', 'limit'].includes(clave) || (valor.startsWith('eq.') && String(fila[clave]) === valor.slice(3)));

  entorno.solicitar = async (ruta, { metodo = 'GET', token, parametros = {}, cuerpo, prefer } = {}) => {
    entorno.llamadas.push({ ruta, metodo, parametros, cuerpo, prefer });
    if (entorno.sinConexion) throw new Error('Sin conexión');
    const usuario = usuarios[token];
    if (!usuario) return { ok: false, status: 401, datos: null };
    if (usuario.rol === 'Administrador') return { ok: false, status: 403, datos: null };

    if (ruta === '/rest/v1/evento') {
      return { ok: true, status: 200, datos: eventos.filter(fila => coincide(fila, parametros)) };
    }
    if (ruta === '/rest/v1/rpc/resumen_gestiones') {
      const grupos = new Map();
      for (const fila of entorno.gestiones) {
        const clave = [fila.id_evento, fila.accion, fila.resultado, fila.estado].join('|');
        const grupo = grupos.get(clave) ?? {
          id_evento: fila.id_evento, accion: fila.accion, resultado: fila.resultado, estado: fila.estado, cantidad: 0
        };
        grupo.cantidad += 1;
        grupos.set(clave, grupo);
      }
      return { ok: true, status: 200, datos: [...grupos.values()] };
    }
    const visibles = () => entorno.gestiones.filter(fila =>
      entorno.fugaRls || usuario.rol === 'Supervisor' || fila.id_usuario === usuario.id);

    if (metodo === 'GET') {
      const filtros = entorno.fugaRls
        ? Object.fromEntries(Object.entries(parametros).filter(([clave]) => clave !== 'id_usuario'))
        : parametros;
      let filas = visibles().filter(fila => coincide(fila, filtros));
      if (parametros.order === 'fecha_hora.desc') filas = [...filas].reverse();
      return { ok: true, status: 200, datos: filas.slice(0, Number(parametros.limit ?? 1000)) };
    }

    if (metodo === 'POST') {
      if (usuario.rol !== 'Analista' || Object.keys(cuerpo).some(clave => !COLUMNAS_INSERT.includes(clave))) {
        return { ok: false, status: 403, datos: null };
      }
      if (entorno.gestiones.some(fila => fila.folio === cuerpo.folio)) return { ok: true, status: 201, datos: [] };
      const largo = Array.from(cuerpo.comentario).length; // char_length de PostgreSQL cuenta caracteres
      if (largo < 1 || largo > 300) return { ok: false, status: 400, datos: null };
      const fila = {
        ...cuerpo, id_usuario: usuario.id, estado: 'Registrada', fecha_hora: new Date().toISOString(),
        fecha_actualizacion: null, actualizado_por: null, motivo_anulacion: null
      };
      entorno.gestiones.push(fila);
      return { ok: true, status: 201, datos: [{ ...fila }] };
    }

    if (metodo === 'PATCH') {
      if (usuario.rol !== 'Supervisor' || Object.keys(cuerpo).some(clave => !COLUMNAS_UPDATE.includes(clave))) {
        return { ok: false, status: 403, datos: null };
      }
      entorno.antesDeActualizar?.();
      const objetivo = visibles().filter(fila => coincide(fila, parametros));
      for (const fila of objetivo) {
        Object.assign(fila, cuerpo, { fecha_actualizacion: new Date().toISOString(), actualizado_por: usuario.id });
      }
      return { ok: true, status: 200, datos: objetivo.map(fila => ({ ...fila })) };
    }
    return { ok: false, status: 405, datos: null };
  };

  entorno.identificar = async request => {
    const token = /Bearer (\S+)/.exec(request.headers.get('authorization') ?? '')?.[1];
    const usuario = usuarios[token];
    if (!usuario) return { ok: false, status: 401, mensaje: 'Debes iniciar sesión.' };
    return { ok: true, token, id_usuario: usuario.id, rol: usuario.rol };
  };
  entorno.api = crearApiRest({ solicitar: entorno.solicitar, identificar: entorno.identificar });
  entorno.escribe = () => entorno.llamadas.filter(llamada => llamada.metodo !== 'GET');
  return entorno;
}

function pedir(api, metodo, token, cuerpo, consulta = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  return api(new Request('http://localhost/api/gestion' + consulta, {
    method: metodo, headers, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
  }));
}

const solicitud = (extra = {}) => ({
  folio: randomUUID(), id_evento: 7001, accion: 'Validar evento',
  resultado: 'Sin ticket', comentario: 'Revisé la lectura de ejemplo', ...extra
});

test('crear: guarda solo los cinco campos y la base asigna identidad, estado y fecha', async () => {
  const { api, gestiones, escribe } = crearEntorno();
  const datos = solicitud();
  const resp = await pedir(api, 'POST', 'token-ana', {
    ...datos, id_usuario: 'u-sup', estado: 'Cerrada', fecha_hora: '2000-01-01', actualizado_por: 'u-sup'
  });
  assert.equal(resp.status, 201);
  const { gestion } = await resp.json();
  assert.equal(gestion.folio, datos.folio);
  assert.equal(gestion.id_usuario, 'u-ana');
  assert.equal(gestion.estado, 'Registrada');
  assert.notEqual(gestion.fecha_hora, '2000-01-01');
  assert.equal(gestiones.length, 1);
  assert.deepEqual(escribe().map(llamada => llamada.cuerpo), [datos]);
  const insercion = escribe()[0];
  assert.equal(insercion.parametros.on_conflict, 'folio');
  assert.equal(insercion.prefer, 'return=representation,resolution=ignore-duplicates,missing=default');
});

test('crear: el reintento con el mismo folio no duplica y un folio ajeno responde 409', async () => {
  const { api, gestiones } = crearEntorno();
  const datos = solicitud();
  const primera = await pedir(api, 'POST', 'token-ana', datos);
  const reintento = await pedir(api, 'POST', 'token-ana', datos);
  assert.equal(primera.status, 201);
  assert.equal(reintento.status, 200);
  assert.deepEqual((await reintento.json()).gestion, (await primera.json()).gestion);

  const otraSolicitud = await pedir(api, 'POST', 'token-ana', { ...datos, comentario: 'Otra solicitud' });
  assert.equal(otraSolicitud.status, 409);
  assert.equal((await otraSolicitud.json()).mensaje, 'Ese folio corresponde a otra solicitud.');

  const deOtroUsuario = await pedir(api, 'POST', 'token-beto', datos);
  assert.equal(deOtroUsuario.status, 409);
  assert.equal(gestiones.length, 1);
});

test('crear: evento 7002 y evento inexistente no escriben nada', async () => {
  const { api, gestiones, escribe } = crearEntorno();
  const insuficiente = await pedir(api, 'POST', 'token-ana', solicitud({ id_evento: 7002 }));
  assert.equal(insuficiente.status, 409);
  assert.equal((await insuficiente.json()).mensaje, 'Se requieren antecedentes adicionales para continuar.');
  const inexistente = await pedir(api, 'POST', 'token-ana', solicitud({ id_evento: 9999 }));
  assert.equal(inexistente.status, 404);
  assert.equal((await inexistente.json()).mensaje, 'No se encontró el evento.');
  assert.equal(gestiones.length, 0);
  assert.equal(escribe().length, 0);
});

test('crear: las validaciones del servidor no dependen de la interfaz y no llegan a la base', async () => {
  const { api, llamadas } = crearEntorno();
  for (const comentario of ['', '   ', 'a'.repeat(301), undefined]) {
    const resp = await pedir(api, 'POST', 'token-ana', solicitud({ comentario }));
    assert.equal(resp.status, 422);
    assert.equal((await resp.json()).campo, 'comentario');
  }
  assert.equal((await pedir(api, 'POST', 'token-ana', solicitud({ folio: 'no-es-uuid' }))).status, 422);
  assert.equal((await pedir(api, 'POST', 'token-ana', solicitud({ resultado: 'Evento descartado' }))).status, 422);
  assert.equal(llamadas.length, 0);
});

test('crear: si se pierde la conexión responde 503 sin confirmar y el mismo folio se puede reenviar', async () => {
  const entorno = crearEntorno();
  const datos = solicitud();
  entorno.sinConexion = true;
  const fallida = await pedir(entorno.api, 'POST', 'token-ana', datos);
  assert.equal(fallida.status, 503);
  assert.equal((await fallida.json()).mensaje,
    'No pudimos confirmar el guardado. Tus datos siguen en el formulario. Intenta nuevamente.');
  assert.equal(entorno.gestiones.length, 0);

  entorno.sinConexion = false;
  assert.equal((await pedir(entorno.api, 'POST', 'token-ana', datos)).status, 201);
  assert.equal(entorno.gestiones.length, 1);
});

test('permisos: sin sesión, Administrador, Supervisor y Analista según la matriz', async () => {
  const { api, gestiones } = crearEntorno();
  assert.equal((await pedir(api, 'GET', undefined)).status, 401);
  assert.equal((await pedir(api, 'POST', 'token-falso', solicitud())).status, 401);

  assert.equal((await pedir(api, 'GET', 'token-adm')).status, 403);
  assert.equal((await pedir(api, 'POST', 'token-adm', solicitud())).status, 403);
  assert.equal((await pedir(api, 'POST', 'token-sup', solicitud())).status, 403);

  const datos = solicitud();
  await pedir(api, 'POST', 'token-ana', datos);
  const cerrar = await pedir(api, 'PATCH', 'token-ana', { folio: datos.folio, estado: 'Cerrada' });
  assert.equal(cerrar.status, 403);
  const anular = await pedir(api, 'PATCH', 'token-ana', { folio: datos.folio, estado: 'Anulada', motivo_anulacion: 'x' });
  assert.equal(anular.status, 403);
  assert.equal(gestiones[0].estado, 'Registrada');
});

test('no existe eliminación: DELETE responde 405 y las gestiones permanecen', async () => {
  const { api, gestiones } = crearEntorno();
  const datos = solicitud();
  await pedir(api, 'POST', 'token-ana', datos);
  for (const token of ['token-ana', 'token-sup', undefined]) {
    const resp = await pedir(api, 'DELETE', token, { folio: datos.folio });
    assert.equal(resp.status, 405);
    assert.equal(resp.headers.get('allow'), 'GET, POST, PATCH');
  }
  assert.equal(gestiones.length, 1);
});

test('consultar: lista vacía, propias del Analista, todas del Supervisor y filtro por estado', async () => {
  const { api } = crearEntorno();
  const vacia = await pedir(api, 'GET', 'token-ana');
  assert.equal(vacia.status, 200);
  assert.deepEqual(await vacia.json(), { gestiones: [], rol: 'Analista' });

  const deAna = solicitud();
  const deBeto = solicitud();
  await pedir(api, 'POST', 'token-ana', deAna);
  await pedir(api, 'POST', 'token-beto', deBeto);

  const propias = (await (await pedir(api, 'GET', 'token-ana')).json()).gestiones;
  assert.deepEqual(propias.map(g => g.folio), [deAna.folio]);
  const todas = (await (await pedir(api, 'GET', 'token-sup')).json()).gestiones;
  assert.deepEqual(todas.map(g => g.folio).sort(), [deAna.folio, deBeto.folio].sort());

  await pedir(api, 'PATCH', 'token-sup', { folio: deAna.folio, estado: 'Cerrada' });
  const cerradas = (await (await pedir(api, 'GET', 'token-sup', undefined, '?estado=Cerrada')).json()).gestiones;
  assert.deepEqual(cerradas.map(g => g.folio), [deAna.folio]);
  assert.equal((await (await pedir(api, 'GET', 'token-sup')).json()).rol, 'Supervisor');
  assert.equal((await pedir(api, 'GET', 'token-sup', undefined, '?estado=Borrada')).status, 422);
});

test('robustez 5: un registro inexistente, de otro usuario o con folio inválido no entrega datos', async () => {
  const { api } = crearEntorno();
  const ajena = solicitud();
  await pedir(api, 'POST', 'token-beto', ajena);

  const inexistente = await pedir(api, 'GET', 'token-ana', undefined, '?folio=' + randomUUID());
  assert.equal(inexistente.status, 404);
  assert.deepEqual(await inexistente.json(), { mensaje: 'No se encontró la gestión.' });

  const deOtro = await pedir(api, 'GET', 'token-ana', undefined, '?folio=' + ajena.folio);
  assert.equal(deOtro.status, 404);
  assert.equal((await pedir(api, 'GET', 'token-sup', undefined, '?folio=' + ajena.folio)).status, 200);
  assert.equal((await pedir(api, 'GET', 'token-ana', undefined, '?folio=abc')).status, 422);
});

test('actualizar: el Supervisor cierra sin alterar la decisión y la base registra la auditoría', async () => {
  const { api, gestiones, escribe } = crearEntorno();
  const datos = solicitud();
  await pedir(api, 'POST', 'token-ana', datos);
  const resp = await pedir(api, 'PATCH', 'token-sup', { folio: datos.folio, estado: 'Cerrada', comentario: 'No debe cambiar' });
  assert.equal(resp.status, 200);
  const { gestion } = await resp.json();
  assert.equal(gestion.estado, 'Cerrada');
  assert.equal(gestion.comentario, datos.comentario);
  assert.equal(gestion.actualizado_por, 'u-sup');
  assert.ok(gestion.fecha_actualizacion);
  assert.deepEqual(escribe().at(-1).cuerpo, { estado: 'Cerrada' });
  assert.equal(gestiones.length, 1);
});

test('actualizar: transiciones inválidas, motivo obligatorio y anulación definitiva sin borrar el registro', async () => {
  const { api, gestiones } = crearEntorno();
  const datos = solicitud();
  await pedir(api, 'POST', 'token-ana', datos);
  const cambiar = cuerpo => pedir(api, 'PATCH', 'token-sup', { folio: datos.folio, ...cuerpo });

  assert.equal((await cambiar({ estado: 'Registrada' })).status, 409);
  assert.equal((await cambiar({ estado: 'Eliminada' })).status, 409);
  assert.equal((await cambiar({ estado: 'Anulada' })).status, 422);
  assert.equal((await cambiar({ estado: 'Anulada', motivo_anulacion: '  ' })).status, 422);
  assert.equal((await cambiar({ estado: 'Anulada', motivo_anulacion: 'a'.repeat(301) })).status, 422);
  assert.equal(gestiones[0].estado, 'Registrada');

  assert.equal((await cambiar({ estado: 'Cerrada' })).status, 200);
  assert.equal((await cambiar({ estado: 'Cerrada' })).status, 409);
  const anulada = await cambiar({ estado: 'Anulada', motivo_anulacion: ' Evento duplicado ' });
  assert.equal(anulada.status, 200);
  assert.equal((await anulada.json()).gestion.motivo_anulacion, 'Evento duplicado');

  assert.equal((await cambiar({ estado: 'Cerrada' })).status, 409);
  assert.equal((await cambiar({ estado: 'Anulada', motivo_anulacion: 'Otro' })).status, 409);
  assert.equal(gestiones.length, 1);
  assert.equal(gestiones[0].estado, 'Anulada');
  assert.equal((await pedir(api, 'PATCH', 'token-sup', { folio: randomUUID(), estado: 'Cerrada' })).status, 404);
  assert.equal((await pedir(api, 'PATCH', 'token-sup', { folio: 'x', estado: 'Cerrada' })).status, 422);
});

test('actualizar: un cambio concurrente no se pisa y responde 409', async () => {
  const entorno = crearEntorno();
  const datos = solicitud();
  await pedir(entorno.api, 'POST', 'token-ana', datos);
  entorno.antesDeActualizar = () => { entorno.gestiones[0].estado = 'Cerrada'; };
  const resp = await pedir(entorno.api, 'PATCH', 'token-sup', { folio: datos.folio, estado: 'Anulada', motivo_anulacion: 'Duplicado' });
  assert.equal(resp.status, 409);
  assert.equal(entorno.gestiones[0].estado, 'Cerrada');
  assert.equal(entorno.gestiones[0].motivo_anulacion, null);
});

test('formato, origen, sesión y fallas del servicio', async () => {
  const entorno = crearEntorno();
  const sinJson = await entorno.api(new Request('http://localhost/api/gestion', {
    method: 'POST', headers: { Authorization: 'Bearer token-ana', 'Content-Type': 'text/plain' }, body: 'x'
  }));
  assert.equal(sinJson.status, 415);
  const ilegible = await entorno.api(new Request('http://localhost/api/gestion', {
    method: 'POST', headers: { Authorization: 'Bearer token-ana', 'Content-Type': 'application/json' }, body: '{'
  }));
  assert.equal(ilegible.status, 400);
  assert.equal((await pedir(entorno.api, 'PUT', 'token-ana', {})).status, 405);

  const conOrigen = crearApiRest({ solicitar: entorno.solicitar, identificar: entorno.identificar, origenPermitido: () => false });
  assert.equal((await pedir(conOrigen, 'POST', 'token-ana', solicitud())).status, 403);
  assert.equal(entorno.escribe().length, 0);

  const sesionCaida = crearApiRest({ solicitar: entorno.solicitar, identificar: async () => { throw new Error('caída'); } });
  assert.equal((await pedir(sesionCaida, 'GET', 'token-ana')).status, 503);

  entorno.sinConexion = true;
  const lista = await pedir(entorno.api, 'GET', 'token-ana');
  assert.equal(lista.status, 503);
  assert.equal((await lista.json()).mensaje, 'No pudimos cargar las gestiones. Intenta nuevamente.');
});

test('crear: tras un conflicto de folio la consulta se filtra por el usuario autenticado', async () => {
  const { api, llamadas } = crearEntorno();
  const datos = solicitud();
  await pedir(api, 'POST', 'token-ana', datos);
  await pedir(api, 'POST', 'token-ana', datos);
  const consultas = llamadas.filter(llamada => llamada.metodo === 'GET' && llamada.parametros.folio);
  assert.equal(consultas.length, 1);
  assert.equal(consultas[0].parametros.id_usuario, 'eq.u-ana');
});

test('crear: aunque RLS filtrara mal, un folio de otro usuario no se devuelve como reintento exitoso', async () => {
  const entorno = crearEntorno();
  const datos = solicitud();
  await pedir(entorno.api, 'POST', 'token-beto', datos);
  entorno.fugaRls = true;
  const resp = await pedir(entorno.api, 'POST', 'token-ana', datos);
  assert.equal(resp.status, 409);
  assert.deepEqual(await resp.json(), { mensaje: 'Ese folio corresponde a otra solicitud.' });
  assert.equal(entorno.gestiones.length, 1);
});

test('crear: el límite de 300 se cuenta en caracteres Unicode y id_evento respeta el rango INTEGER', async () => {
  const { api, gestiones } = crearEntorno();
  const emojis300 = '😀'.repeat(300);
  assert.equal((await pedir(api, 'POST', 'token-ana', solicitud({ comentario: emojis300 }))).status, 201);
  const largo = await pedir(api, 'POST', 'token-ana', solicitud({ comentario: '😀'.repeat(301) }));
  assert.equal(largo.status, 422);
  assert.equal((await largo.json()).mensaje, 'Usa un comentario válido de hasta 300 caracteres.');
  assert.equal(gestiones.length, 1);

  assert.equal((await pedir(api, 'POST', 'token-ana', solicitud({ id_evento: 2147483647 }))).status, 404);
  const fuera = await pedir(api, 'POST', 'token-ana', solicitud({ id_evento: 2147483648 }));
  assert.equal(fuera.status, 422);
  assert.equal((await fuera.json()).mensaje, 'El evento o el folio de la solicitud no es válido.');
});

test('resumen operativo: devuelve solo cantidades y respeta los roles', async () => {
  const { api, llamadas } = crearEntorno();
  await pedir(api, 'POST', 'token-ana', solicitud());
  await pedir(api, 'POST', 'token-beto', solicitud());
  await pedir(api, 'POST', 'token-beto', solicitud({ accion: 'Descartar evento', resultado: 'Evento descartado' }));

  for (const token of ['token-ana', 'token-sup']) {
    const resp = await pedir(api, 'GET', token, undefined, '?resumen=1');
    assert.equal(resp.status, 200);
    const { resumen } = await resp.json();
    assert.equal(resumen.reduce((total, fila) => total + fila.cantidad, 0), 3);
    for (const fila of resumen) {
      assert.deepEqual(Object.keys(fila).sort(), ['accion', 'cantidad', 'estado', 'id_evento', 'resultado']);
    }
  }
  assert.equal((await pedir(api, 'GET', 'token-adm', undefined, '?resumen=1')).status, 403);
  assert.equal((await pedir(api, 'GET', undefined, undefined, '?resumen=1')).status, 401);
  assert.ok(llamadas.some(llamada => llamada.ruta === '/rest/v1/rpc/resumen_gestiones' && llamada.metodo === 'GET'));
});

test('resumen operativo: si falla la conexión responde 503', async () => {
  const entorno = crearEntorno();
  entorno.sinConexion = true;
  const resp = await pedir(entorno.api, 'GET', 'token-ana', undefined, '?resumen=1');
  assert.equal(resp.status, 503);
  assert.equal((await resp.json()).mensaje, 'No pudimos cargar el resumen. Intenta nuevamente.');
});

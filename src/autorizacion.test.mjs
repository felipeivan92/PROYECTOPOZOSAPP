
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { identificar } from './autorizacion.mjs';

const TOKEN = 'abc.def.ghi';
const USUARIO = 'usuario-demo';
const URL_APP = 'https://aquatrace.example';

const entornoAnterior = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY:
    process.env.SUPABASE_PUBLISHABLE_KEY
};

before(() => {
  process.env.SUPABASE_URL =
    'https://demo.supabase.co';

  process.env.SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_demo';
});

after(() => {
  for (const [clave, valor] of
    Object.entries(entornoAnterior)) {

    if (valor === undefined) {
      delete process.env[clave];
    } else {
      process.env[clave] = valor;
    }
  }
});

function solicitud(conSesion = true) {

  const headers = {};

  if (conSesion) {
    headers.Cookie =
      '__Host-aqua_session=' + TOKEN;
  }

  return new Request(
    URL_APP + '/api/gestion',
    { headers }
  );
}

function simularPerfil(t, perfiles) {

  t.mock.method(
    globalThis,
    'fetch',
    async (url, opciones) => {

      assert.equal(
        opciones.headers.Authorization,
        'Bearer ' + TOKEN
      );

      const destino = new URL(url);

      if (destino.pathname === '/auth/v1/user') {
        return Response.json({
          id: USUARIO
        });
      }

      assert.equal(
        destino.pathname,
        '/rest/v1/perfil'
      );

      assert.equal(
        destino.searchParams.get('id_usuario'),
        'eq.' + USUARIO
      );

      return Response.json(perfiles);
    }
  );
}

// 1. Usuario sin sesión.

test('Rechaza usuarios sin sesión', async () => {

  const resultado = await identificar(
    solicitud(false)
  );

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 401);
  assert.equal(resultado.token, undefined);
});

// 2. Analista autorizado.

test('Identifica correctamente al Analista', async t => {

  simularPerfil(t, [{
    id_usuario: USUARIO,
    rol: 'Analista',
    activo: true
  }]);

  const resultado = await identificar(solicitud());

  assert.deepEqual(resultado, {
    ok: true,
    token: TOKEN,
    id_usuario: USUARIO,
    rol: 'Analista'
  });
});

// 3. Supervisor autorizado.

test('Identifica correctamente al Supervisor', async t => {

  simularPerfil(t, [{
    id_usuario: USUARIO,
    rol: 'Supervisor',
    activo: true
  }]);

  const resultado = await identificar(solicitud());

  assert.deepEqual(resultado, {
    ok: true,
    token: TOKEN,
    id_usuario: USUARIO,
    rol: 'Supervisor'
  });
});

// 4. Usuario sin perfil.

test('Rechaza usuarios sin perfil', async t => {

  simularPerfil(t, []);

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 403);
});

// 5. Perfil inactivo.

test('Rechaza perfiles inactivos', async t => {

  simularPerfil(t, [{
    id_usuario: USUARIO,
    rol: 'Analista',
    activo: false
  }]);

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 403);
});

// 6. Rol no operativo.

test('Rechaza roles no autorizados', async t => {

  simularPerfil(t, [{
    id_usuario: USUARIO,
    rol: 'Administrador',
    activo: true
  }]);

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 403);
});

// 7. Identidad inconsistente.

test('Rechaza perfiles de otro usuario', async t => {

  simularPerfil(t, [{
    id_usuario: 'otro-usuario',
    rol: 'Analista',
    activo: true
  }]);

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 403);
});

// 8. Sesión expirada.

test('Rechaza sesiones expiradas', async t => {

  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { mensaje: 'Token expirado' },
      { status: 401 }
    )
  );

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 401);
});

// 9. Fallo del servicio.

test('Deniega acceso ante fallos del servicio', async t => {

  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Servicio no disponible');
  });

  const resultado = await identificar(solicitud());

  assert.equal(resultado.ok, false);
  assert.equal(resultado.status, 503);
});

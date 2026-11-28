import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import api from '../api/auth.mjs';

const URL_APP = 'https://aquatrace.example';
const TOKEN = 'abc.def.ghi';
const COOKIE = '__Host-aqua_session=' + TOKEN;

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

function solicitud(datos, origen = URL_APP, cookie) {
  const headers = {
    'Content-Type': 'application/json',
    Origin: origen
  };

  if (cookie) headers.Cookie = cookie;

  return new Request(URL_APP + '/api/auth', {
    method: 'POST',
    headers,
    body: JSON.stringify(datos)
  });
}

// 1. Rechazar una consulta sin sesión.
test('Rechaza usuarios sin sesión', async () => {
  const respuesta = await api.fetch(
    new Request(URL_APP + '/api/auth')
  );

  assert.equal(respuesta.status, 401);
});

// 2. Rechazar solicitudes desde otro origen.
test('Rechaza solicitudes de origen externo', async () => {
  const respuesta = await api.fetch(
    solicitud(
      { accion: 'login' },
      'https://externo.example'
    )
  );

  assert.equal(respuesta.status, 403);
});

// 3. Inicio de sesión correcto.
test('Inicio de sesión con cookie segura', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      access_token: TOKEN,
      expires_in: 3600
    })
  );

  const respuesta = await api.fetch(
    solicitud({
      accion: 'login',
      email: 'analista@aquatrace.example',
      password: 'clave-ficticia-de-prueba'
    })
  );

  assert.equal(respuesta.status, 200);

  const cookie = respuesta.headers.get('set-cookie');

  assert.match(cookie, /__Host-aqua_session=/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Max-Age=3600/);

  const datos = await respuesta.json();

  assert.equal(datos.token, undefined);
  assert.equal(datos.access_token, undefined);
});

// 4. Credenciales incorrectas.
test('Rechaza credenciales incorrectas', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { mensaje: 'Credenciales inválidas' },
      { status: 400 }
    )
  );

  const respuesta = await api.fetch(
    solicitud({
      accion: 'login',
      email: 'analista@aquatrace.example',
      password: 'incorrecta'
    })
  );

  assert.equal(respuesta.status, 401);
  assert.equal(
    respuesta.headers.get('set-cookie'),
    null
  );
});

// 5. Verificación de sesión.
test('Verifica la identidad del usuario', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      id: 'usuario-ficticio',
      email: 'analista@aquatrace.example'
    })
  );

  const respuesta = await api.fetch(
    new Request(URL_APP + '/api/auth', {
      headers: { Cookie: COOKIE }
    })
  );

  const datos = await respuesta.json();

  assert.equal(respuesta.status, 200);
  assert.equal(datos.autenticado, true);
  assert.equal(datos.usuario.id, 'usuario-ficticio');
});

// 6. Sesión expirada.
test('Rechaza una sesión expirada', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { mensaje: 'Token expirado' },
      { status: 401 }
    )
  );

  const respuesta = await api.fetch(
    new Request(URL_APP + '/api/auth', {
      headers: { Cookie: COOKIE }
    })
  );

  assert.equal(respuesta.status, 401);
});

// 7. Cierre de sesión.
test('Elimina la cookie al cerrar sesión', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    new Response(null, { status: 204 })
  );

  const respuesta = await api.fetch(
    solicitud(
      { accion: 'logout' },
      URL_APP,
      COOKIE
    )
  );

  assert.equal(respuesta.status, 200);

  assert.match(
    respuesta.headers.get('set-cookie'),
    /Max-Age=0/
  );
});

// 8. Interrupción del servicio.
test('Controla fallos de conexión', async t => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Conexión interrumpida');
  });

  const respuesta = await api.fetch(
    solicitud({
      accion: 'login',
      email: 'analista@aquatrace.example',
      password: 'clave-ficticia-de-prueba'
    })
  );

  assert.equal(respuesta.status, 503);
});

 ese codigo?

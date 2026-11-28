
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import api from '../api/panel.mjs';

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

function solicitud(cookie, metodo = 'GET') {
  const headers = {};

  if (cookie) headers.Cookie = cookie;

  return new Request(URL_APP + '/api/panel', {
    method: metodo,
    headers
  });
}

// 1. Acceso sin sesión.
test('Redirige al login cuando no existe sesión', async () => {
  const respuesta = await api.fetch(solicitud());

  assert.equal(respuesta.status, 303);
  assert.equal(
    respuesta.headers.get('location'),
    '/login.html'
  );
});

// 2. Sesión expirada.
test('Rechaza sesiones expiradas', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      { mensaje: 'Token expirado' },
      { status: 401 }
    )
  );

  const respuesta = await api.fetch(
    solicitud(COOKIE)
  );

  assert.equal(respuesta.status, 303);
});

// 3. Usuario sin perfil.
test('Rechaza usuarios sin perfil', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (new URL(url).pathname === '/auth/v1/user') {
      return Response.json({
        id: 'usuario-demo'
      });
    }

    return Response.json([]);
  });

  const respuesta = await api.fetch(
    solicitud(COOKIE)
  );

  assert.equal(respuesta.status, 403);
});

// 4. Usuario inactivo.
test('Rechaza usuarios inactivos', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (new URL(url).pathname === '/auth/v1/user') {
      return Response.json({
        id: 'usuario-demo'
      });
    }

    return Response.json([{
      id_usuario: 'usuario-demo',
      rol: 'Analista',
      activo: false
    }]);
  });

  const respuesta = await api.fetch(
    solicitud(COOKIE)
  );

  assert.equal(respuesta.status, 403);
});

// 5. Rol no autorizado.
test('Rechaza roles sin permisos operativos', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (new URL(url).pathname === '/auth/v1/user') {
      return Response.json({
        id: 'usuario-demo'
      });
    }

    return Response.json([{
      id_usuario: 'usuario-demo',
      rol: 'Administrador',
      activo: true
    }]);
  });

  const respuesta = await api.fetch(
    solicitud(COOKIE)
  );

  assert.equal(respuesta.status, 403);
});

// 6. Fallo de Supabase.
test('Deniega el acceso ante fallos del servicio', async t => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('Servicio no disponible');
  });

  const respuesta = await api.fetch(
    solicitud(COOKIE)
  );

  assert.equal(respuesta.status, 503);
});

// 7. Método HTTP no permitido.
test('Rechaza métodos HTTP no autorizados', async () => {
  const respuesta = await api.fetch(
    solicitud(COOKIE, 'POST')
  );

  assert.equal(respuesta.status, 405);
});


// 8 y 9. Acceso permitido al panel privado.
// Se comprueba el ingreso de ambos roles operativos.

for (const rol of ['Analista', 'Supervisor']) {

  test(`Permite acceso al panel al ${rol}`, async t => {

    t.mock.method(globalThis, 'fetch', async url => {

      const ruta = new URL(url).pathname;

      if (ruta === '/auth/v1/user') {
        return Response.json({
          id: 'usuario-demo'
        });
      }

      if (ruta === '/rest/v1/perfil') {
        return Response.json([{
          id_usuario: 'usuario-demo',
          rol,
          activo: true
        }]);
      }

      throw new Error('Solicitud inesperada');

    });

    const respuesta = await api.fetch(
      solicitud(COOKIE)
    );

    // El usuario autorizado debe recibir el panel.

    assert.equal(respuesta.status, 200);

    assert.match(
      respuesta.headers.get('content-type'),
      /text\/html/
    );

    // Verificar los encabezados de seguridad.

    assert.equal(
      respuesta.headers.get('cache-control'),
      'private, no-store'
    );

    assert.equal(
      respuesta.headers.get('x-content-type-options'),
      'nosniff'
    );

    // Comprobar que se entrega la interfaz correcta.

    const contenido = await respuesta.text();

    assert.match(contenido, /Aqua Trace/);
    assert.match(contenido, /id="cerrar-sesion"/);
    assert.match(contenido, /id="gestion"/);

    // El token no debe aparecer en el HTML.

    assert.equal(
      contenido.includes(TOKEN),
      false
    );

  });

}



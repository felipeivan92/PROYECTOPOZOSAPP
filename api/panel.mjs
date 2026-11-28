
import { readFile } from 'node:fs/promises';
import { identificar } from '../src/autorizacion.mjs';

function responder(texto, status, headers = {}) {
  return new Response(texto, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}

function redirigirLogin() {
  return responder(null, 303, {
    Location: '/login.html'
  });
}

async function accederPanel(request) {

  // 1. Verificar el método HTTP.

  if (request.method !== 'GET') {
    return responder(
      'Método no permitido.',
      405,
      { Allow: 'GET' }
    );
  }

  // 2. Utilizar el módulo compartido de autorización.

  const sesion = await identificar(request);

  if (!sesion.ok) {

    if (sesion.status === 401) {
      return redirigirLogin();
    }

    return responder(
      sesion.mensaje,
      sesion.status
    );
  }

  // 3. Entregar la pantalla privada.

  try {

    const contenido = await readFile(
      new URL(
        '../src/private/panel.html',
        import.meta.url
      ),
      'utf8'
    );

    return responder(contenido, 200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

  } catch {

    return responder(
      'El panel no está disponible temporalmente. Intenta nuevamente.',
      503
    );
  }
}

export default { fetch: accederPanel };

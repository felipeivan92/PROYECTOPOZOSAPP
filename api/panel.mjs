
import { readFile } from 'node:fs/promises';
import { verificarSesion } from '../src/auth.mjs';
import { obtenerToken } from '../src/sesion.mjs';
import { solicitarSupabase } from '../src/supabase.mjs';

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

  // Permitir únicamente la consulta de la pantalla.
  if (request.method !== 'GET') {
    return responder(
      'Método no permitido.',
      405,
      { Allow: 'GET' }
    );
  }

  // 1. Obtener y verificar la sesión.
  const token = obtenerToken(request);

  if (!token) {
    return redirigirLogin();
  }

  const sesion = await verificarSesion(token);

  if (!sesion.ok) {
    if (sesion.status === 401) {
      return redirigirLogin();
    }

    return responder(
      'No fue posible verificar tu sesión. Intenta nuevamente.',
      503
    );
  }

  try {

    // 2. Consultar el perfil del usuario autenticado.
    const respuesta = await solicitarSupabase(
      '/rest/v1/perfil',
      {
        token,
        parametros: {
          select: 'id_usuario,rol,activo',
          id_usuario: `eq.${sesion.usuario.id}`
        }
      }
    );

    if (!respuesta.ok) {
      return responder(
        'No fue posible verificar los permisos de acceso.',
        503
      );
    }

    const perfiles = respuesta.datos;

    if (!Array.isArray(perfiles) ||
        perfiles.length !== 1) {
      return responder('Acceso no autorizado.', 403);
    }

    const perfil = perfiles[0];

    // 3. Comprobar que el perfil esté habilitado.
    if (
      perfil.id_usuario !== sesion.usuario.id ||
      perfil.activo !== true ||
      !['Analista', 'Supervisor'].includes(perfil.rol)
    ) {
      return responder(
        'No tienes permisos para acceder al panel.',
        403
      );
    }

    // 4. Cargar la pantalla desde el directorio privado.
    const contenido = await readFile(
      new URL('../src/private/panel.html', import.meta.url),
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

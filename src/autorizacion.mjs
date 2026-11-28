
import { obtenerToken } from './sesion.mjs';
import { verificarSesion } from './auth.mjs';
import { solicitarSupabase } from './supabase.mjs';

const ROLES_OPERATIVOS = [
  'Analista',
  'Supervisor'
];

function error(status, mensaje) {
  return {
    ok: false,
    status,
    mensaje
  };
}

export async function identificar(request) {

  // 1. Obtener el token desde la cookie segura.

  const token = obtenerToken(request);

  if (!token) {
    return error(
      401,
      'Debes iniciar sesión.'
    );
  }

  try {

    // 2. Verificar la identidad en Supabase Auth.

    const sesion = await verificarSesion(token);

    if (!sesion.ok) {
      return error(
        sesion.status,
        sesion.mensaje
      );
    }

    const id_usuario = sesion.usuario.id;

    // 3. Consultar el perfil del usuario autenticado.

    const respuesta = await solicitarSupabase(
      '/rest/v1/perfil',
      {
        token,
        parametros: {
          select: 'id_usuario,rol,activo',
          id_usuario: `eq.${id_usuario}`
        }
      }
    );

    if (!respuesta.ok) {

      if (respuesta.status === 401) {
        return error(
          401,
          'Tu sesión no es válida o ha expirado.'
        );
      }

      return error(
        503,
        'No fue posible verificar los permisos de acceso.'
      );
    }

    // 4. Verificar la existencia del perfil.

    const perfiles = respuesta.datos;

    if (
      !Array.isArray(perfiles) ||
      perfiles.length !== 1
    ) {
      return error(
        403,
        'Acceso no autorizado.'
      );
    }

    const perfil = perfiles[0];

    // 5. Verificar identidad, estado y rol.

    if (
      perfil.id_usuario !== id_usuario ||
      perfil.activo !== true ||
      !ROLES_OPERATIVOS.includes(perfil.rol)
    ) {
      return error(
        403,
        'No tienes permisos para esta operación.'
      );
    }

    // 6. Entregar la identidad autorizada.
    // Uso exclusivo del servidor.

    return {
      ok: true,
      token,
      id_usuario,
      rol: perfil.rol
    };

  } catch {
    return error(
      503,
      'No fue posible verificar la autorización del usuario.'
    );
  }
}

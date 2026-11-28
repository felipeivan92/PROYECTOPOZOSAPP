
import { solicitarSupabase } from './supabase.mjs';

function error(status, mensaje) {
  return { ok: false, status, mensaje };
}

function tokenValido(token) {
  return typeof token === 'string' &&
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

// Inicio de sesión.
export async function iniciarSesion(email, password) {
  if (
    typeof email !== 'string' ||
    !email.trim() ||
    email.length > 254 ||
    typeof password !== 'string' ||
    !password ||
    password.length > 1024
  ) {
    return error(400, 'Ingresa tu correo y contraseña.');
  }

  try {
    const respuesta = await solicitarSupabase('/auth/v1/token', {
      metodo: 'POST',
      parametros: { grant_type: 'password' },
      cuerpo: {
        email: email.trim(),
        password
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 429) {
        return error(429, 'Demasiados intentos. Intenta más tarde.');
      }

      if ([400, 401, 403, 422].includes(respuesta.status)) {
        return error(401, 'Correo o contraseña incorrectos.');
      }

      return error(503, 'No fue posible iniciar sesión.');
    }

    const token = respuesta.datos?.access_token;
    const duracion = respuesta.datos?.expires_in;

    if (!tokenValido(token) ||
        !Number.isFinite(duracion) ||
        duracion <= 0) {
      return error(503, 'No fue posible establecer una sesión.');
    }

    // Uso exclusivo del servidor.
    return {
      ok: true,
      token,
      duracion
    };

  } catch {
    return error(503, 'Servicio de autenticación no disponible.');
  }
}

// Verificación de identidad en Supabase.
export async function verificarSesion(token) {
  if (!tokenValido(token)) {
    return error(401, 'Debes iniciar sesión.');
  }

  try {
    const respuesta = await solicitarSupabase('/auth/v1/user', {
      token
    });

    if (!respuesta.ok) {
      if ([400, 401, 403].includes(respuesta.status)) {
        return error(401, 'Tu sesión no es válida o ha expirado.');
      }

      return error(503, 'No fue posible verificar la sesión.');
    }

    const usuario = respuesta.datos;

    if (!usuario?.id) {
      return error(401, 'Usuario no identificado.');
    }

    return {
      ok: true,
      usuario: {
        id: usuario.id,
        email: usuario.email
      }
    };

  } catch {
    return error(503, 'No fue posible verificar la sesión.');
  }
}

// Cierre de sesión.
export async function cerrarSesion(token) {
  if (!tokenValido(token)) {
    return { ok: true };
  }

  try {
    const respuesta = await solicitarSupabase('/auth/v1/logout', {
      metodo: 'POST',
      token,
      parametros: { scope: 'local' }
    });

    if (respuesta.ok ||
        [401, 403].includes(respuesta.status)) {
      return { ok: true };
    }

    return error(503, 'No fue posible cerrar la sesión en Supabase.');

  } catch {
    return error(503, 'Servicio de autenticación no disponible.');
  }
}

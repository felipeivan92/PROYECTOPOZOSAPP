
const NOMBRE_COOKIE = '__Host-aqua_session';

const ATRIBUTOS_COOKIE =
  'Path=/; HttpOnly; Secure; SameSite=Lax';

export function obtenerToken(request) {
  const cookies = request.headers.get('cookie') ?? '';

  const coincidencias = cookies
    .split(';')
    .map(cookie => cookie.trim())
    .filter(cookie =>
      cookie.startsWith(NOMBRE_COOKIE + '=')
    );

  if (coincidencias.length !== 1) {
    return null;
  }

  const token = coincidencias[0]
    .slice(NOMBRE_COOKIE.length + 1);

  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    return null;
  }

  return token;
}

export function crearCookieSesion(token, duracion) {
  if (
    typeof token !== 'string' ||
    token.length > 3500 ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) ||
    !Number.isFinite(duracion) ||
    duracion < 1
  ) {
    throw new Error('Sesión inválida.');
  }

  const segundos = Math.min(
    Math.floor(duracion),
    3600
  );

  return `${NOMBRE_COOKIE}=${token}; Max-Age=${segundos}; ${ATRIBUTOS_COOKIE}`;
}

export function eliminarCookieSesion() {
  return `${NOMBRE_COOKIE}=; Max-Age=0; ${ATRIBUTOS_COOKIE}`;
}

export function origenPermitido(request) {
  const origen = request.headers.get('origin');

  if (!origen) {
    return false;
  }

  return origen === new URL(request.url).origin;
}

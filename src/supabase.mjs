
function obtenerConfiguracion() {
  const valor = process.env.SUPABASE_URL?.trim();
  const clave = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!valor || !clave?.startsWith('sb_publishable_')) {
    throw new Error('Configuración de Supabase inválida o incompleta.');
  }

  const url = new URL(valor);

  if (url.protocol !== 'https:' ||
      !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
      url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('URL de Supabase inválida.');
  }

  return { url, clave };
}

export async function solicitarSupabase(ruta, {
  metodo = 'GET',
  token,
  parametros = {},
  cuerpo,
  prefer
} = {}) {
  const esToken = ruta === '/auth/v1/token';
  const esAuth = [
    '/auth/v1/user',
    '/auth/v1/logout'
  ].includes(ruta);

  const esDato =
    /^\/rest\/v1\/(?:rpc\/)?[a-z_][a-z0-9_]*$/.test(ruta);

  if (!esToken && !esAuth && !esDato) {
    throw new Error('Ruta de Supabase no permitida.');
  }

  if (esToken && metodo !== 'POST') {
    throw new Error('Método no permitido para autenticación.');
  }

  if (!esToken &&
      (typeof token !== 'string' || !token.trim())) {
    throw new Error('Se requiere una sesión de usuario.');
  }

  const { url, clave } = obtenerConfiguracion();
  const destino = new URL(ruta, url);

  destino.search =
    new URLSearchParams(parametros).toString();

  const headers = {
    apikey: clave,
    Accept: 'application/json'
  };

  if (token && !esToken) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (prefer) {
    headers.Prefer = prefer;
  }

  const respuesta = await fetch(destino, {
    method: metodo,
    headers,
    body: cuerpo === undefined
      ? undefined
      : JSON.stringify(cuerpo),
    signal: AbortSignal.timeout(8000),
    redirect: 'error',
    cache: 'no-store'
  });

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  return {
    ok: respuesta.ok,
    status: respuesta.status,
    datos
  };
}

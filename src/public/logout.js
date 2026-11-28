
export function configurarCierreSesion(boton, mensaje) {
  if (!boton || !mensaje) return;

  let procesando = false;

  boton.addEventListener('click', async () => {
    if (procesando) return;

    procesando = true;
    boton.disabled = true;
    boton.textContent = 'Cerrando sesión…';

    mensaje.dataset.tipo = '';
    mensaje.textContent = 'Finalizando sesión.';

    try {
      const respuesta = await fetch('/api/auth', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        credentials: 'same-origin',
        cache: 'no-store',

        body: JSON.stringify({
          accion: 'logout'
        }),

        signal: AbortSignal.timeout(15000)
      });

      if (respuesta.ok) {
        window.location.replace('/login.html');
        return;
      }

      // Comprobar si la sesión local fue eliminada.
      const verificacion = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      });

      if (verificacion.status === 401) {
        window.location.replace('/login.html');
        return;
      }

      mensaje.dataset.tipo = 'error';
      mensaje.textContent =
        'No fue posible confirmar el cierre de sesión. Intenta nuevamente.';

    } catch {
      mensaje.dataset.tipo = 'error';
      mensaje.textContent =
        'No fue posible conectar con el sistema. Intenta nuevamente.';

    } finally {
      procesando = false;
      boton.disabled = false;
      boton.textContent = 'Cerrar sesión';
    }
  });
}


const formulario = document.querySelector('#login');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const ingresar = document.querySelector('#ingresar');
const mensaje = document.querySelector('#mensaje');

let procesando = false;

function mostrarMensaje(tipo, texto) {
  mensaje.dataset.tipo = tipo;
  mensaje.textContent = texto;
}

function cambiarEstado(cargando) {
  procesando = cargando;
  ingresar.disabled = cargando;
  email.disabled = cargando;
  password.disabled = cargando;

  ingresar.textContent = cargando
    ? 'Ingresando…'
    : 'Iniciar sesión';

  formulario.setAttribute(
    'aria-busy',
    String(cargando)
  );
}

formulario.addEventListener('submit', async event => {
  event.preventDefault();

  if (procesando) return;

  if (!formulario.reportValidity()) {
    return;
  }

  const datos = {
    accion: 'login',
    email: email.value.trim(),
    password: password.value
  };

  cambiarEstado(true);

  mostrarMensaje(
    '',
    'Verificando credenciales…'
  );

  let autenticado = false;

  try {
    const respuesta = await fetch('/api/auth', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      credentials: 'same-origin',
      cache: 'no-store',

      body: JSON.stringify(datos),

      signal: AbortSignal.timeout(20000)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(
        'error',
        resultado.mensaje ||
        'No fue posible iniciar sesión.'
      );

      return;
    }

    autenticado = true;
    password.value = '';

    mostrarMensaje(
      'exito',
      'Sesión iniciada correctamente.'
    );

    window.location.replace('/');

  } catch {
    mostrarMensaje(
      'error',
      'No fue posible conectar con el sistema. Intenta nuevamente.'
    );

  } finally {
    if (!autenticado) {
      cambiarEstado(false);
    }
  }
});

// Habilitar el formulario cuando JavaScript esté disponible.
ingresar.disabled = false;

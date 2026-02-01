const form = document.getElementById('registerForm');
const errorEl = document.getElementById('error');

let csrfToken = null;

/**
 * Pedimos el CSRF token al backend
 */
fetch('/csrf-token')
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
  });

/**
 * Enviamos el registro
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Error en el registro';
      return;
    }

    /**
     * Registro exitoso
     * → redirigimos a iniciar sesion
     */
    window.location.href = '/login.html';

  } catch (err) {
    errorEl.textContent = 'Error de conexión';
  }
});

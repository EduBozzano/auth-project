const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');

let csrfToken = null;

// Pedimos el CSRF token al backend
fetch('/csrf-token', {
  credentials: 'include', // importante para cookies, asegura que se envien
})
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
  });

// Enviamos el login
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const formData = new FormData(form);

  const body = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  };

  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken, // protección CSRF
    },
    credentials: 'same-origin', // permite cookie de sesión
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.message || 'Error al iniciar sesión';
    return;
  }

  // Login OK
  window.location.href = '/profile.html';
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-password');
  const passwordInput = document.querySelector('#password');

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? '🙈' : '👁️';
  });
});

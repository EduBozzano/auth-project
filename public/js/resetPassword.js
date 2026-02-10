const form = document.getElementById('reset-form');
const msg = document.getElementById('msg');

// Pedimos el CSRF token al backend
fetch('/csrf-token', {
  credentials: 'include', // importante para cookies, asegura que se envien
})
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
  });

// Leer token desde la URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
console.log(token)
if (!token) {
  msg.textContent = 'Token inválido';
  form.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Validación front
  console.log(password, confirmPassword)
  if (password !== confirmPassword) {
    msg.textContent = 'Las contraseñas no coinciden';
    return;
  }

  if (password.length < 8) {
    msg.textContent = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  const res = await fetch(`/auth/reset-password/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify({ password, confirmPassword })
  });

  const data = await res.json();
  msg.textContent = data.message;

  if (res.ok) {
    form.reset();
  }
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

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const matchHint = document.getElementById('password-match');

function checkPasswordMatch() {
  if (!passwordInput.value || !confirmInput.value) {
    matchHint.classList.remove('valid');
    matchHint.classList.add('invalid');
    return;
  }

  if (passwordInput.value === confirmInput.value) {
    matchHint.classList.remove('invalid');
    matchHint.classList.add('valid');
  } else {
    matchHint.classList.remove('valid');
    matchHint.classList.add('invalid');
  }
}
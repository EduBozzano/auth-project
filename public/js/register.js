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
  const confirmPassword = document.getElementById('confirmPassword').value;

  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password, confirmPassword })
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

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const ruleLength = document.getElementById('rule-length');

  if (!passwordInput || !ruleLength) return;

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    // Regla: mínimo 8 caracteres
    if (password.length >= 8) {
      ruleLength.classList.remove('invalid');
      ruleLength.classList.add('valid');
    } else {
      ruleLength.classList.remove('valid');
      ruleLength.classList.add('invalid');
    }
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

passwordInput.addEventListener('input', checkPasswordMatch);
confirmInput.addEventListener('input', checkPasswordMatch);

document.addEventListener('DOMContentLoaded', () => {
  // const toggleBtn = document.querySelector('.toggle-password');
  // const passwordInput = document.querySelector('#password');

  // if (!toggleBtn || !passwordInput) return;
  document.querySelectorAll('.toggle-password').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const passwordInput = toggleBtn.previousElementSibling;
      const isPassword = passwordInput.type === 'password';

      passwordInput.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }); 
});
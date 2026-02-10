const form = document.getElementById('forgot-form');
const msg = document.getElementById('msg');

// Pedimos el CSRF token al backend
fetch('/csrf-token', {
  credentials: 'include', // importante para cookies, asegura que se envien
})
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
  });

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;

  const res = await fetch('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CSRF-Token': csrfToken },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  msg.textContent = data.message;
});

document.addEventListener('DOMContentLoaded', async () => {
  const emailEl = document.getElementById('email');
  const roleEl = document.getElementById('role');
  const errorEl = document.getElementById('error');

  try {
    console.log("intenta fetch profile")
    const res = await fetch('/auth/profile', {
      credentials: 'include', // importante para cookie, se envian junto con la peticion http
      headers: {
        Authorization: `Bearer ${accessToken}`, // JWT (si existe)
        },
    });
    console.log("logro fetch profile1")
    if (!res.ok) {
      window.location.href = '/login.html';
      console.log("no logro fetch profile !res.ok")
      return;
    }

    console.log("logro fetch profile2")
    const data = await res.json();

    emailEl.textContent = data.email;
    roleEl.textContent = data.role;
  } catch (err) {
    errorEl.textContent = 'Error al cargar el perfil';
    
  }
});

//listener para el logout
document.getElementById('logout').addEventListener('click', async () => {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  window.location.href = '/login.html';
});


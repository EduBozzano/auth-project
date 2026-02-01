document.addEventListener('DOMContentLoaded', async () => {
  const emailEl = document.getElementById('email');
  const roleEl = document.getElementById('role');
  const errorEl = document.getElementById('error');

  try {
    const res = await fetch('/auth/profile', {
      credentials: 'include', // importante para cookie, se envian junto con la peticion http
      //  headers: {
      //    Authorization: `Bearer ${accessToken}`, // JWT (si existe)
      //    },
    });

    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }


    const data = await res.json();

    emailEl.textContent = data.email;
    roleEl.textContent = data.role;
  } catch (err) {
    errorEl.textContent = 'Error al cargar el perfil';
    //errorEl.textContent = err ;
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


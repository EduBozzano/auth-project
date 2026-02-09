const table = document.getElementById('usersTable');
const errorEl = document.getElementById('error');

// Pedimos el CSRF token al backend
fetch('/csrf-token', {
  credentials: 'include', // importante para cookies, asegura que se envien
})
  .then(res => res.json())
  .then(data => {
    csrfToken = data.csrfToken;
  });

async function loadUsers() {
  try {
    const res = await fetch('/auth/users', {
      credentials: 'include',
    });

    if (!res.ok) {
      window.location.href = '/login.html';
      return;
    }

    const users = await res.json();

    table.innerHTML = '';

    users.forEach(user => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button data-id="${user.id}" class="danger">Eliminar</button>
        </td>
      `;

      table.appendChild(tr);
    });
  } catch {
    errorEl.textContent = 'Error al cargar usuarios';
  }
}

table.addEventListener('click', async (e) => {
  if (!e.target.matches('button')) return;

  const id = e.target.dataset.id;

  if (!confirm('¿Eliminar usuario?')) return;

  await fetch(`/auth/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
        'CSRF-Token': csrfToken,
    },
  });

  loadUsers();
});

document.getElementById('logout').addEventListener('click', async () => {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  window.location.href = '/login.html';
});

loadUsers();

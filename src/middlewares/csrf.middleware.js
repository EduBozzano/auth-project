import csrf from 'csurf';

/**
 * Middleware CSRF basado en sesiones
 * - Usa la sesión para almacenar el secreto
 * - Valida tokens en requests que cambian estado
 */
export const csrfProtection = csrf({
  cookie: false, // usamos session, NO cookie separada
});

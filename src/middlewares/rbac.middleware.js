/**
 * Middleware para restringir acceso por rol - Role Based Access Control (RBAC)
 * Recibe una lista de roles permitidos
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    let userRole;

    // Caso sesiones con cookies
    if (req.session && req.session.role) {
      userRole = req.session.role;
    }

    // Caso JWT
    if (req.user && req.user.role) {
      userRole = req.user.role;
    }

    if (!userRole) {
      return res.status(403).json({
        message: 'Acceso denegado',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    next();
  };
};

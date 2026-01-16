/**
 * Middleware para restringir acceso por rol
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.role) {
      return res.status(401).json({
        message: 'No autenticado',
      });
    }

    if (req.session.role !== role) {
      return res.status(403).json({
        message: 'No autorizado',
      });
    }

    next();
  };
};

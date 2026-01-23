// Este middleware protege rutas que requieren autenticación por sesión

export const authenticated = (req, res, next) => {
  /*
    req.session existe gracias a express-session.
    Si no hay cookie válida o la sesión expiró,
    req.session.userId será undefined.
  */

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: 'No autenticado',
    });
  }

  /*
    Si existe userId, la request pertenece
    a un usuario autenticado.
    Dejamos continuar.
  */
  next();
};

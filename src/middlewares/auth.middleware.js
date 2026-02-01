import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación unificado
 * - Soporta JWT (Authorization: Bearer)
 * - Soporta sesiones por cookies (express-session)
 * - Siempre expone el usuario en req.user
 */
export const isAuthenticate = (req, res, next) => {

// 1. Intentar JWT

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];

      const payload = verifyAccessToken(token);

      // Normalizamos el usuario
      req.user = {
        id: payload.id,
        role: payload.role,
        email: payload.email,
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'JWT inválido o expirado' });
    }
  }


 // 2. Intentar sesión (cookies)

  if (req.session?.user) {
    req.user = {
      id: req.session.user.id,
      role: req.session.user.role,
      email: req.session.user.email,
    };

    return next();
  }


// 3. No autenticado

  return res.status(401).json({ message: 'No autenticado' });
};

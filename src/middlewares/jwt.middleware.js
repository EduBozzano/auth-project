import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación JWT
 */
export const requireJwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Adjuntamos info al request
    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
};

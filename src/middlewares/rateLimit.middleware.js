import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limit específico para login
 * Protege contra ataques de fuerza bruta
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos, tiempo en el que se cuentan los intentos
  max: 5, // máximo 5 intentos en ese tiempo
  standardHeaders: true, // headers estándar RateLimit-* devuelve datos de intentos en el encabezado http
  legacyHeaders: false, // desactiva X-RateLimit-*

  keyGenerator: (req) => {
    // usamos email si existe, sino IP
    if (req.body?.email){
      return req.body.email;
    }

    return ipKeyGenerator(req);
  },
  
  message: {
    message:
      'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
  },
});

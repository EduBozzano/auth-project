import jwt from 'jsonwebtoken';

/**
 * Genera un JWT firmado
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m', 
  });
};

/**
 * Verifica y decodifica un JWT
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/tokenHash.js';
import { RefreshToken } from '../models/RefreshToken.js';

/**
 * ENDPOINT REGISTER
 */
export const register = async (req, res) => {
  const { email, password } = req.body;

  // Validaciones mínimas 
  if (!email || !password) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    //hasheo de password para crear usuario
    const passwordHash = await hashPassword(password);

    await User.create({
      email,
      passwordHash,
    });

    return res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * ENDPOINT LOGIN CON COOKIES
 */
export const login = async (req, res) => {
  try {
    //Obtener credenciales desde el body
    const { email, password, rememberMe } = req.body;

    //Buscar usuario
    const user = await User.findOne({
      where: { email: email },
    });

    //Mensaje genérico para evitar enumeración de usuarios
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    //Comparar contraseña hasheada
    const passwordMatch = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    //Login exitoso y crear sesión
    //Regenerar ID de sesión para evitar session fixation
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          message: 'Error al iniciar sesión, credenciales inválidas',
        });
      }

      //Guardar datos mínimos en la sesión
      req.session.user = {
        id: user.id,
        role: user.role,
        email: user.email,
      };

      //Manejo de sesión persistente
      if (rememberMe) {
        // 7 días (expresado en ms)
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
      } else {
        //sesión de navegador (logout al cerrar el navegador)
        req.session.cookie.expires = false;
      }

      //Respuesta final
      return res.status(200).json({
        message: 'Login exitoso',
      });
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      message: 'Error interno',
    });
  }
};

/**
 * ENDPOINT LOGIN CON JWT 
 */
export const loginJwt = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({
      where: { email: email },
    });

    // Mensaje genérico
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    // Comparar password
    const passwordMatch = await comparePassword(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
      });
    }

    // Payload mínimo
    const payload = {
      userId: user.id,
      role: user.role,
    };

    // Generar Access Token y RefreshToken
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token hasheado
    await RefreshToken.create({
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Enviar refresh token como cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // indica que la cookie solo se envia por https (solo en produccion SI O SI), false en desarrollo
      maxAge: 7 * 24 * 60 * 60 * 1000, //duracion 7 dias
    });

    return res.status(200).json({
      message: 'Login exitoso',
      accessToken,
    });
  } catch (error) {
    console.error('Error en login JWT:', error);
    return res.status(500).json({
      message: 'Error interno',
    });
  }
};

/**
 * ENDPOINT LOGOUT CON COOKIES
 */
export const logout = (req, res) => {
  // Si no hay sesión activa, no hay nada que destruir
  if (!req.session) {
    return res.status(200).json({
      message: 'No hay sesión activa'
    });
  }

  // Destruimos la sesión en el servidor
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      return res.status(500).json({
        message: 'Error al cerrar sesión'
      });
    }

    // Eliminamos la cookie de sesión en el cliente
    res.clearCookie('connect.sid');

    return res.status(200).json({
      message: 'Sesión cerrada correctamente'
    });
  });
};

/**
 * ENDPOINT REFRESH ACCESS TOKEN
 */
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      where: {
        tokenHash: hashToken(refreshToken),
        userId: decoded.userId,
      },
    });

    if (!storedToken) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * ENDPOINT LOGOUT CON JWT
 */

export const logoutJWT = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await RefreshToken.destroy({
      where: {
        tokenHash: hashToken(refreshToken),
      },
    });
  }

  res.clearCookie('refreshToken');

  return res.status(200).json({
    message: 'Logout exitoso',
  });
};

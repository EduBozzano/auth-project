import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/tokenHash.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordReset } from '../models/PasswordReset.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

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

/**
 * ENDPOINT FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  // No revelar si existe o no
  if (!user) {
    return res.json({
      message: 'Si el email existe, recibirás un correo con instrucciones'
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await PasswordReset.create({
    userId: user.id,
    token,
    expiresAt: expires
  });

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Soporte" <no-reply@AuthService.com>',
    to: user.email,
    subject: 'Recuperar contraseña',
    html: `
      <p>Hacé click para resetear tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
    `
  });


  res.json({
    message: 'Si el email existe, recibirás un correo con instrucciones'
  });
};

/**
 * ENDPOINT RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Buscar token válido
  const resetRecord = await PasswordReset.findOne({
    where: {
      token,
      used: false,
      expiresAt: {
        [Op.gt]: new Date() // greater than gt (mayor que) para que se verifique que la fecha de expiracion del token sea mayor a la fecha actual (el token aun no vence)
      }
    }
  });

  if (!resetRecord) {
    return res.status(400).json({
      message: 'Token inválido o expirado'
    });
  }

  // Buscar usuario
  const user = await User.findByPk(resetRecord.userId);

  if (!user) {
    return res.status(400).json({
      message: 'Usuario no encontrado'
    });
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update({
    passwordHash: hashedPassword
  });

  // Invalidar token
  await resetRecord.update({
    used: true
  });

  res.json({
    message: 'Contraseña actualizada correctamente'
  });
};

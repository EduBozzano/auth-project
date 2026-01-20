import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

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
    const { emailUser, password, rememberMe } = req.body;

    //Buscar usuario
    const user = await User.findOne({
      where: { email: emailUser },
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
          message: 'Error al iniciar sesión',
        });
      }

      //Guardar datos mínimos en la sesión
      req.session.userId = user.id;
      req.session.role = user.role;

      //Manejo de sesión persistente
      if (rememberMe) {
        //ejemplo: 7 días (expresado en ms)
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
    const { emailUser, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({
      where: { email: emailUser },
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

    // Generar JWT
    const token = generateToken({
      sub: user.id,
      role: user.role,
    });

    return res.status(200).json({
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    console.error('Error en login JWT:', error);
    return res.status(500).json({
      message: 'Error interno',
    });
  }
};

/**
 * ENDPOINT LOGOUT
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

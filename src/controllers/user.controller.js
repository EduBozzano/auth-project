import { User } from '../models/User.js';

/**
 * ENDPOINT PROFILE
 */
export const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'createdAt', 'role'],
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * ENDPOINT PROFILE ADMIN 
 */
export const profileAdmin = async (req, res) => {
    res.json({
        message: 'Bienvenido admin',
        user: req.user.email,
    });  
};
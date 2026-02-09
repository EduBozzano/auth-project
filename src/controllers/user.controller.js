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
    console.log("hola")
    res.json({
        message: 'Bienvenido admin',
        user: req.user.email,
    });  
};

/**
 * Obtener todos los usuarios (ADMIN)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar usuario por ID (ADMIN)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que un admin se borre a sí mismo
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario',
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};

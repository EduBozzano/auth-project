import { User } from '../models/User.js';
import { hashPassword } from '../utils/hash.js';

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

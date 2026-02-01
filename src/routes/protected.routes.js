import { Router } from 'express';
import { isAuthenticate } from '../middlewares/auth.middleware.js';
import { profile } from '../controllers/auth.controller.js';

const router = Router();

//ruta para obtener perfil de usuario
router.get('/profile', isAuthenticate, profile);

//ruta para eliminar usuario por ID (admin)
router.delete(
  '/admin/users/:id',
  isAuthenticate,
  requireRole('admin'),
  (req, res) => {
    res.json({
      message: 'Usuario eliminado (admin)',
    });
  }
);

export default router;

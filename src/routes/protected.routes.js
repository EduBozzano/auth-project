import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

//ruta para obtener perfil de usuario
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    message: 'Perfil del usuario',
    userId: req.session.userId,
  });
});

//ruta para eliminar usuario por ID (admin)
router.delete(
  '/admin/users/:id',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    res.json({
      message: 'Usuario eliminado (admin)',
    });
  }
);

export default router;

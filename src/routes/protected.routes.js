import { Router } from 'express';
import { isAuthenticate } from '../middlewares/auth.middleware.js';
import { deleteUser, getAllUsers, profile, profileAdmin } from '../controllers/user.controller.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
const router = Router();

//ruta para obtener perfil de usuario
router.get('/profile', isAuthenticate, profile);

//ruta admin
router.get('/admin', isAuthenticate, authorizeRoles('ADMIN'), profileAdmin);
router.get('/users', isAuthenticate, authorizeRoles('ADMIN'), getAllUsers);
router.delete('/users/:id', isAuthenticate, authorizeRoles('ADMIN'), deleteUser);

export default router;

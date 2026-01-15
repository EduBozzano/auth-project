import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/authSession.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);

export default router;

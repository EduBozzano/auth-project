import { Router } from 'express';
import { login, loginJwt, register, logout } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/authSession.middleware.js';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimiter,  login);
router.post('/login-jwt', loginRateLimiter,  loginJwt);
router.post('/logout', isAuthenticated, logout);

export default router;

import { Router } from 'express';
import { login, loginJwt, register, logout, logoutJWT } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/authSession.middleware.js';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { loginValidator } from '../validators/auth.validator.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginRateLimiter, loginValidator, validateRequest, login);
router.post('/login-jwt', loginRateLimiter, loginValidator, validateRequest, loginJwt);
router.post('/logout', isAuthenticated, logout);
router.post('/logout-jwt', isAuthenticated, logoutJWT);

export default router;

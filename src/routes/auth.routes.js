import { Router } from 'express';
import { login, loginJwt, register, logout, logoutJWT, refreshAccessToken, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { isAuthenticate } from '../middlewares/auth.middleware.js';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { loginValidator, registerValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/auth.validator.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginRateLimiter, loginValidator, validateRequest, login);
router.post('/login-jwt', loginRateLimiter, loginValidator, validateRequest, loginJwt);
router.post('/logout', isAuthenticate, logout);
router.post('/logout-jwt', isAuthenticate, logoutJWT);
router.post('/refreshToken', refreshAccessToken);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validateRequest, resetPassword);

export default router;

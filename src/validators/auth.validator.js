import { body } from 'express-validator';

export const loginValidator = [
  // Email
  body('email')
    .trim() // elimina espacios al inicio y final
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(), // normaliza el email

  // Password
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  // RememberMe
  body('rememberMe')
    .optional()
    .isBoolean()
    .toBoolean()

];

export const registerValidator = [
  // Email
  body('email')
    .trim() // elimina espacios al inicio y final
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(), // normaliza el email

  // Password
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  // Confirmed Password
  body('confirmPassword')
  .custom((value, { req }) => value === req.body.password)
  .withMessage('Las contraseñas no coinciden')

];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no coinciden')
];

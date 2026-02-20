import { Router } from "express";
import { createAccount, login } from "./handlers";
import { body } from "express-validator";
import { handleInputError } from "./middleware/validation";

const router = Router();

// Autenticacion y registro
router.post('/auth/register',
  body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').isLength({min: 8}).withMessage('El password es muy corto, minimo 8 caracteres'),
  handleInputError,
  createAccount);

router.post('/auth/login',
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').notEmpty().withMessage('El password es obligatorio'),
  handleInputError,
  login);

export default router;


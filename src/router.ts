import { Router } from "express";
import { createAccount, getUser, getUserByHandle, login, updateImage, updateProfile } from "./handlers";
import { body } from "express-validator";
import { handleInputError } from "./middleware/validation";
import { authenticate } from "./middleware/auth";

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

router.get('/user',
  authenticate,
  getUser);

router.patch('/user',
    body('handle').notEmpty().withMessage('El handle no puede ir vacio'),
    body('description').notEmpty().withMessage('La descripcion no puede ir vacia'),
  handleInputError,
  authenticate,
  updateProfile);

router.post('/user/image', 
  authenticate,
  updateImage);

router.get('/:handle',
  getUserByHandle);

export default router;


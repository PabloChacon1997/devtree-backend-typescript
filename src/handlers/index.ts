import { Request, Response } from 'express'
import { validationResult } from 'express-validator';
import slug from 'slug';

import User from "../models/User";
import { checkPassword, hasPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';


export const createAccount = async (req: Request, res: Response) => {

  const { email, password } = req.body;
  const userExists = await User.findOne({email});
  if (userExists) {
    const error = new Error('Ya existe un usuario con este correo, inice sesion');
    return res.status(409).json({error: error.message});
  }

  const handle = slug(req.body.handle, '');
  const handleExists = await User.findOne({handle});
  if (handleExists) {
    const error = new Error('Ya existe un usuario con este nombre, inice sesion');
    return res.status(409).json({error: error.message});
  }

  const user = new User(req.body);
  user.password = await hasPassword(password);
  user.handle = handle;
  await user.save();
  return res.send({msg: 'Registro creado correctamente'});
}

export const login = async (req: Request, res: Response) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const { email, password } = req.body;
  const user = await User.findOne({email});
  if (!user) {
    const error = new Error('No existe un usuario con este correo, registrese');
    return res.status(404).json({error: error.message});
  }
  const isPasswordCorrect = await checkPassword(password, user.password)
  if (!isPasswordCorrect) {
    const error = new Error('El password es incorrecto');
    return res.status(404).json({error: error.message});
  }

  const token = generateJWT({id: user.id});
  return res.send(token);
}

export const getUser = async (req: Request, res: Response) => {
  res.send(req.user);
}



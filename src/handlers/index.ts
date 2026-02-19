import { Request, Response } from 'express'
import slug from 'slug';
import User from "../models/User";
import { hasPassword } from '../utils/auth';
import { validationResult } from 'express-validator';


export const createAccount = async (req: Request, res: Response) => {

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }

  const { email, password } = req.body;
  const userExists = await User.findOne({email});
  if (userExists) {
    const error = new Error('Ya existe un usuario con este correo, inice sesion');
    res.status(409).json({error: error.message});
    return;
  }

  const handle = slug(req.body.handle, '');
  const handleExists = await User.findOne({handle});
  if (handleExists) {
    const error = new Error('Ya existe un usuario con este nombre, inice sesion');
    res.status(409).json({error: error.message});
    return;
  }

  const user = new User(req.body);
  user.password = await hasPassword(password);
  user.handle = handle;
  await user.save();
  res.send({msg: 'Registro creado correctamente'});
}



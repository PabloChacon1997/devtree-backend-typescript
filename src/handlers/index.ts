import { Request, Response } from 'express'
import { validationResult } from 'express-validator';
import slug from 'slug';
import formidable from 'formidable'
import {v4 as uuuid} from 'uuid'

import User from "../models/User";
import { checkPassword, hasPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';
import cloudinary from '../config/cloudinary';


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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { description, links } =req.body;
    const handle = slug(req.body.handle, '');
    const handleExists = await User.findOne({handle});
    if (handleExists && handleExists.email !== req.user.email ) {
      const error = new Error('Ya existe un usuario con este nombre, inice sesion');
      return res.status(409).json({error: error.message});
    }
    req.user.description = description;
    req.user.handle = handle;
    req.user.links = links;
    await req.user.save();
    return res.send('Perfil actualizado correctamente');
  } catch (e) {
    const error = new Error('Internal Server Error');
    return res.status(500).json({error: error.message});
  }
}

export const updateImage = async (req: Request, res: Response) => {
  const form = formidable({multiples: false});
  try {
    form.parse(req, (error, fields, files) => {
      cloudinary.uploader.upload(files.file[0].filepath,{ public_id: uuuid() }, async function(error, result) {
        if(error) {
          const error = new Error('Hubo un error al subir la imagen');
          return res.status(500).json({error: error.message});
        }
        if(result) {
          req.user.image = result.secure_url;
          await req.user.save();
          return res.json({image: result.secure_url});
        }
      });
    });
  } catch (e) {
    const error = new Error('Internal Server Error');
    return res.status(500).json({error: error.message});
  }
}


export const getUserByHandle = async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const user = await User.findOne({ handle }).select('-_id -__v -email -password');
    if(!user) {
      const error = new Error('El usuario no existe');
      return res.status(404).json({error: error.message});
    }
    res.json(user)
  } catch (e) {
    const error = new Error('Internal Server Error');
    return res.status(500).json({error: error.message});
  }
}


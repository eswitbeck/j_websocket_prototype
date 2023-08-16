import express, { Request, Response, NextFunction } from 'express';
import { userController } from '../controllers/user';

export const router = express.Router();

router.post('/', userController.addUser, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.user);
});

router.put('/', userController.updateUser, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.user);
});

router.delete('/:id', userController.deleteUser, (req: Request, res: Response, next: NextFunction): void => {
  res.sendStatus(204);
});


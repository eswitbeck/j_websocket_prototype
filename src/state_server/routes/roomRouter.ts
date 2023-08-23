import express, { Request, Response, NextFunction } from 'express';
import { roomController } from '../controllers/room';

export const router = express.Router();

// for initial connect
router.get('/:id/users', roomController.getRoomUsers, (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json(res.locals.users);
});

router.get('/:id', roomController.getRoom, (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json(res.locals.room);
});

router.get('/', roomController.getAllRooms, (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json(res.locals.rooms);
});

router.post('/', roomController.addRoom, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.room);
});

router.put('/:id', roomController.updateRoom, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.room);
});

router.delete('/:id', roomController.deleteRoom, (req: Request, res: Response, next: NextFunction): void => {
  res.sendStatus(204);
});


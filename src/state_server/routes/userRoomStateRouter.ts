import express, { Request, Response, NextFunction } from 'express';
import { userRoomStateController } from '../controllers/userRoomState';

export const router = express.Router();

router.post('/', userRoomStateController.addUserRoomState, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.userRoomState);
});

// indexed by user_id and room_id, so both in body
router.put('/', userRoomStateController.updateUserRoomState, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.userRoomState);
});

// indexed by user_id and room_id, so both in query
router.delete('/', userRoomStateController.deleteUserRoomState, (req: Request, res: Response, next: NextFunction): void => {
  res.sendStatus(204);
});


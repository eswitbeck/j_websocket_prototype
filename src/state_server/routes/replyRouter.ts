import express, { Request, Response, NextFunction } from 'express';
import { replyController } from '../controllers/replies';

export const router = express.Router();

router.post('/', replyController.addReply, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.reply);
});

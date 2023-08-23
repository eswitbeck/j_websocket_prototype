import express, { Request, Response, NextFunction } from 'express';
import { questionController } from '../controllers/question';

export const router = express.Router();

//may eventually need /:id/replies for reconnects

router.post('/', questionController.addQuestion, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.question);
});

router.put('/:id', questionController.updateQuestion, (req: Request, res: Response, next: NextFunction): void => {
  res.status(201).json(res.locals.question);
});

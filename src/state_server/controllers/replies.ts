import { query } from '../models/db';
import ErrorObj from '../../util/errorHandling';
import express, { Request, Response, NextFunction } from 'express';

type ReplyFunction = (req: Request, res: Response, next: NextFunction) => void;
interface ReplyController {
  addReply: ReplyFunction,
}

export const replyController: ReplyController = {
  addReply: (req: Request, res: Response, next: NextFunction) => {
    // needs text, user_id, room_id
    if (req.body.text === undefined || typeof req.body.text !== 'string' ||
        req.body.user_id === undefined || typeof req.body.user_id !== 'number' ||
        req.body.question_id === undefined || typeof req.body.question_id !== 'number' ||
        req.body.room_id === undefined || typeof req.body.room_id !== 'number') {
      next(new ErrorObj('replyController: addReply',
                        'Missing parameters',
                        400,
                        'Missing one of: text, user_id, room_id, question_id'));
      return;
    }
    // extract body
    const { text, user_id, room_id, question_id } = req.body;
    // insert reply
    const insertString = `
      INSERT INTO Replies (user_id, room_id, question_id, text) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    query(insertString, [user_id, room_id, question_id, text], (err, result) => {
      if (err) {
        next(new ErrorObj('replyController: addReply',
                          generateQueryError(err),
                          500,
                          'Unknown failure adding reply.'));
        return;
      }
      // append to response
      res.locals.reply = result.rows[0];
      next();
    });
  }
};

function generateQueryError (err: Error): string {
  return `Error in query: ${err.message}`;
}

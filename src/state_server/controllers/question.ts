import { query } from '../models/db';
import ErrorObj from '../../util/errorHandling';
import express, { Request, Response, NextFunction } from 'express';

type QuestionFunction = (req: Request, res: Response, next: NextFunction) => void;
interface QuestionController {
  addQuestion: QuestionFunction,
  updateQuestion: QuestionFunction,
}

export const questionController: QuestionController = {
  addQuestion: (req: Request, res: Response, next: NextFunction) => {
    // needs text, user_id, room_id
    if (req.body.text === undefined || typeof req.body.text !== 'string'
        req.body.user_id === undefined || typeof req.body.user_id !== 'number'
        req.body.room_id === undefined || typeof req.body.room_id !== 'number') {
      next(new ErrorObj('questionController: addQuestion',
                        'Missing parameters'
                        400,
                        'Missing one of: text, user_id, room_id'));
      return;
    }
    // extract body
    const { text, user_id, room_id } = req.body;
    // insert question
    const insertString = `
      INSERT INTO Questions (user_id, room_id, text) VALUES ($1, $2, $3)
      RETURNING *;
    `;
    query(insertString, [user_id, room_id, text], (err, result) => {
      if (err) {
        next(new ErrorObj('questionController: addQuestion',
                          generateQueryError(err),
                          500,
                          'Unknown failure adding question.'));
        return;
      }
      // append to response
      res.locals.question = result.rows[0];
      next();
    });
  },
  updateQuestion: (req: Request, res: Response, next: NextFunction) => {
    // verify body (text and question_id)
    if (req.body.text === undefined || typeof req.body.questionname !== 'string' ||
        req.params.id === undefined) {
      next(new ErrorObj('questionController: updateQuestion',
                        'text or id not provided',
                        400,
                        'Confirm both text and question id are provided'));
      return;
    } else {
      // extract body
      const { text } = req.body;
      const { id } = req.params;
      // update question
      const updateString = `
        UPDATE Questions SET text = $2 WHERE id = $1
        RETURNING *;
      `;
      query(updateString, [id, text], (err, result) => {
        if (err) {
          next(new ErrorObj('questionController: udpateQuestion',
                            generateQueryError(err),
                            500));
          return;
        }
        // respond
        if (!result.rows.length) {
          next(new ErrorObj('questionController: udpateQuestion',
                            'Question does not exist',
                            400,
                            'Can only update existing questions. Confirm question_id is correct'));
          return;
        }
        res.locals.question = result.rows[0];
        next();
      });
    }
  }
};

function generateQueryError (err: Error): string {
  return `Error in query: ${err.message}`;
}

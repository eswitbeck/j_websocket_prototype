import { query } from '../models/db';
import ErrorObj from '../../util/errorHandling';
import express, { Request, Response, NextFunction } from 'express';

type UserFunction = (req: Request, res: Response, next: NextFunction) => void;
interface UserController {
  addUser: UserFunction,
  updateUser: UserFunction,
  deleteUser: UserFunction
}

export const userController: UserController = {
  addUser: (req: Request, res: Response, next: NextFunction) => {
    // verify body (only needs username)
    if (req.body.username === undefined || typeof req.body.username !== 'string') {
      next(new ErrorObj('userController: addUser',
                        'username not provided',
                        400,
                        'You must provide a username'));
      return;
    }
    // extract body
    const { username } = req.body;
    // insert user
    const insertString = `
      INSERT INTO Users (username) VALUES ($1)
      RETURNING *;
    `;
    query(insertString, [username], (err, result) => {
      if (err) {
        next(new ErrorObj('userController: addUser',
                          generateQueryError(err),
                          500,
                          'Unknown failure adding user.'));
        return;
      }
      // append to response
      res.locals.user = result.rows[0];
      next();
    });
  },
  updateUser: (req: Request, res: Response, next: NextFunction) => {
    // verify body (username and user_id)
    if (req.body.username === undefined || typeof req.body.username !== 'string' ||
        req.params.id === undefined) {
      next(new ErrorObj('userController: updateUser',
                        'username or id not provided',
                        400,
                        'Confirm both username and user id are provided'));
      return;
    } else {
      // extract body
      const { username } = req.body;
      const { id } = req.params;
      // update user
      const updateString = `
        UPDATE Users SET username = $2 WHERE id = $1
        RETURNING *;
      `;
      query(updateString, [id, username], (err, result) => {
        if (err) {
          next(new ErrorObj('userController: udpateUser',
                            generateQueryError(err),
                            500));
          return;
        }
        // respond
        if (!result.rows.length) {
          next(new ErrorObj('userController: udpateUser',
                            'User does not exist',
                            400,
                            'Can only update existing users. Confirm user_id is correct'));
          return;
        }
        res.locals.user = result.rows[0];
        next();
      });
    }
  },
  deleteUser: (req: Request, res: Response, next: NextFunction) => {
    // verify query
    if (req.params.id === undefined) {
      next(new ErrorObj('userController: deleteUser',
                        'No user id provided',
                        400,
                        'No user id provided'));
      return;
    }
    // delete user
    const { id } = req.params;
    const deleteString = `
      DELETE FROM Users
      WHERE id = $1;
    `;
    query(deleteString, [id], err => {
      if (err) {
        next(new ErrorObj('userController: deleteUser',
                          generateQueryError(err),
                          500,
                          'Unknown failure deleting user.'));
        return;
      }
      next();
    });
  }
};

function generateQueryError (err: Error): string {
  return `Error in query: ${err.message}`;
}

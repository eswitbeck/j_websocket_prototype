import { query } from '../models/db';
import ErrorObj from '../../util/errorHandling';
import express, { Request, Response, NextFunction } from 'express';

type UserRoomStateFunction = (req: Request, res: Response, next: NextFunction) => void;
interface UserRoomStateController {
  addUserRoomState: UserRoomStateFunction,
  updateUserRoomState: UserRoomStateFunction,
  deleteUserRoomState: UserRoomStateFunction
}

export const userRoomStateController: UserRoomStateController = {
  addUserRoomState: (req: Request, res: Response, next: NextFunction) => {
    // only needs user_id and room_id
    // in body
    // verify both are present
    if (req.body.user_id === undefined || typeof req.body.user_id !== 'number' ||
        req.body.room_id === undefined || typeof req.body.room_id !== 'number') {
        next(new ErrorObj('userRoomStateController: addUserRoomState',
                          'Missing either room_id or user_id',
                          500,
                          'Missing one of: room_id, user_id.'));
      return;
    }
    // extract both
    const { user_id, room_id } = req.body;
    // insert userRoomState
    const insertString = `
      INSERT INTO UserRoomStates (user_id, room_id) VALUES ($1, $2)
      RETURNING *;
    `;
    query(insertString, [user_id, room_id], (err, result) => {
      if (err) {
        next(new ErrorObj('userRoomStateController: addUserRoomState',
                          generateQueryError(err),
                          500,
                          'Unknown failure adding userRoomState.'));
        return;
      }
      // append to response
      res.locals.userRoomState = result.rows[0];
      next();
    });
  },
  updateUserRoomState: (req: Request, res: Response, next: NextFunction) => {
    // verify body (user_id, room_id, amount)
    if (req.body.user_id === undefined || typeof req.body.user_id !== 'number' ||
    req.body.room_id === undefined || typeof req.body.room_id !== 'number' ||
    req.body.amount === undefined || typeof req.body.amount !== 'number') {
      next(new ErrorObj('userRoomStateController: updateUserRoomState',
                        'user_id, room_id, or amount missing',
                        400,
                        'Confirm user_id, room_id, and amount are provided'));
      return;
    } else {
      // extract body
      const { user_id, room_id, amount } = req.body;
      // update userRoomState
      const updateString = `
        UPDATE UserRoomStates SET score = score + $3 WHERE user_id = $1 AND room_id = $2
        RETURNING *;
      `;
      query(updateString, [user_id, room_id, amount], (err, result) => {
        if (err) {
          next(new ErrorObj('userRoomStateController: updateUserRoomState',
                            generateQueryError(err),
                            500));
          return;
        }
        // respond
        if (!result.rows.length) {
          next(new ErrorObj('userRoomStateController: updateUserRoomState',
                            'UserRoomState does not exist',
                            400,
                            'Can only update existing userRoomStates.'));
          return;
        }
        res.locals.userRoomState = result.rows[0];
        next();
      });
    }
  },
  deleteUserRoomState: (req: Request, res: Response, next: NextFunction) => {
    // must come from query
    // need both user_id and room_id
    if (req.query.user_id === undefined || req.query.room_id === undefined) {
      next(new ErrorObj('userRoomStateController: deleteUserRoomState',
                        'Missing either user_id or room_id',
                        400,
                        'Missing one of: user_id, room_id'));
      return;
    }
    // delete userRoomState
    const { user_id, room_id } = <{ user_id: string, room_id: string }>req.query;
    const deleteString = `
      DELETE FROM UserRoomStates
      WHERE user_id = $1 AND room_id = $2;
    `;
    query(deleteString, [user_id, room_id], err => {
      if (err) {
        next(new ErrorObj('userRoomStateController: deleteUserRoomState',
                          generateQueryError(err),
                          500,
                          'Unknown failure deleting userRoomState.'));
        return;
      }
      next();
    });
  }
};

function generateQueryError (err: Error): string {
  return `Error in query: ${err.message}`;
}

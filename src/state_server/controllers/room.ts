import { query } from '../models/db';
import ErrorObj from '../../util/errorHandling';
import express, { Request, Response, NextFunction } from 'express';

type RoomFunction = (req: Request, res: Response, next: NextFunction) => void;
interface RoomController {
  addRoom: RoomFunction,
  updateRoom: RoomFunction,
  deleteRoom: RoomFunction
}

export const roomController: RoomController = {
  addRoom: (req: Request, res: Response, next: NextFunction) => {
    // check room body -- doesn't need room name, but will force name if not
    let name: string;
    let insertString: string;
    let params: string[];
    if (req.body.name === undefined) {
      insertString = `
        INSERT INTO Rooms (name)
        VALUES ('Room_' || currval(pg_get_serial_sequence('Rooms', 'id')))
        RETURNING *;
      `;
      params = [];
    } else {
      // extract body
      ({ name } = req.body);
      // insert room
      insertString = `
        INSERT INTO Rooms (name) VALUES ($1)
        RETURNING *;
      `;
      params = [name];
    }
    query(insertString, params, (err, result) => {
      if (err) {
        let tooLong: boolean = false;
        if (err.code === '22001') tooLong = true;
        next(new ErrorObj('roomController: addRoom',
                          tooLong ? 'Room name too long' : generateQueryError(err),
                          500,
                          tooLong ? 'Room name too long' : 'Unknown failure adding room.'));
        return;
      }
      // append to response
      res.locals.room = result.rows[0];
      next();
    });
  },
  updateRoom: (req: Request, res: Response, next: NextFunction) => {
    // verify body (room and room id)
    if (req.body.name === undefined || typeof req.body.name !== 'string' ||
        req.params.id === undefined) {
      next(new ErrorObj('roomController: updateRoom',
                        'Room name or id not provided',
                        400,
                        'Confirm both room name and room id are provided'));
      return;
    } else {
      // extract body
      const { name } = req.body;
      const { id } = req.params;
      // update room
      const updateString = `
        UPDATE Rooms SET name = $2 WHERE id = $1
        RETURNING *;
      `;
      query(updateString, [id, name], (err, result) => {
        if (err) {
          next(new ErrorObj('roomController: udpateRoom',
                            generateQueryError(err),
                            500));
          return;
        }
        // respond
        if (!result.rows.length) {
          next(new ErrorObj('roomController: udpateRoom',
                            'Room does not exist',
                            400,
                            'Can only update existing rooms. Confirm room_id is correct'));
          return;
        }
        res.locals.room = result.rows[0];
        next();
      });
    }
  },
  deleteRoom: (req: Request, res: Response, next: NextFunction) => {
    // verify query
    if (req.params.id === undefined) {
      next(new ErrorObj('roomController: deleteRoom',
                        'No room id provided',
                        400,
                        'No room id provided'));
      return;
    }
    // delete room
    const { id } = req.params;
    const deleteString = `
      DELETE FROM Rooms
      WHERE id = $1;
    `;
    query(deleteString, [id], err => {
      if (err) {
        next(new ErrorObj('roomController: deleteRoom',
                          generateQueryError(err),
                          500,
                          'Unknown failure deleting room.'));
        return;
      }
      next();
    });
  }
};

function generateQueryError (err: Error): string {
  return `Error in query: ${err.message}`;
}

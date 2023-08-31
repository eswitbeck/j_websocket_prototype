import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { handleSocket } from './roomWebSocketv2';
import ErrorObj from '../util/errorHandling';
const app = express();

app.use(express.json()); 

// api router
// 404

app.get('/game/game.js', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.resolve(__dirname, '../../dist/game.js'));
});

app.get('/game/:id', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index_game.html'));
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index_lobby.html'));
});

app.use(globalErrorHandler);

function globalErrorHandler (
  err: ErrorObj,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(err);
  console.log(err.getServerMessage());
  res.status(err.errorCode).json(err.getClientMessage());
  return;
};

const PORT = 3000;
const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`); });
handleSocket(server);

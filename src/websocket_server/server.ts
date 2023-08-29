import express, { Request, Response, NextFunction } from 'express';
import { handleSocket } from './roomWebSocketv2';
import ErrorObj from '../util/errorHandling';
const app = express();

app.use(express.json()); 

// api router
// 404

app.use(globalErrorHandler);

function globalErrorHandler (
  err: ErrorObj,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log(err.getServerMessage());
  res.status(err.errorCode).json(err.getClientMessage());
  return;
};

const PORT = 3000;
const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`); });
handleSocket(server);

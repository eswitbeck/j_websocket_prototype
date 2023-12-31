import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import ErrorObj from '../util/errorHandling';
import { router as userRouter } from './routes/userRouter';
import { router as roomRouter } from './routes/roomRouter';
import { router as questionRouter } from './routes/questionRouter';
import { router as replyRouter } from './routes/replyRouter';
import { router as userRoomStateRouter } from './routes/userRoomStateRouter';
const app = express();

app.use(cors());
app.use(express.json()); 

// /users endpoint
app.use('/users', userRouter)
// /rooms endpoint
app.use('/rooms', roomRouter)
// /questions endpoint
app.use('/questions', questionRouter)
// /replies endpoint
app.use('/replies', replyRouter)
// /userRoomStates endpoint
 app.use('/userRoomStates', userRoomStateRouter)

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

const PORT = 3001;
const server = app.listen(PORT, () => { console.log(`listening on ${PORT}`); });

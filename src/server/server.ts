import express, { Request, Response, NextFunction } from 'express';
const app = express();

app.use(express.json()); 

app.use(globalErrorHandler);

function globalErrorHandler (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
};

const PORT = 3000;
app.listen(PORT, () => { console.log(`listening on ${PORT}`); });

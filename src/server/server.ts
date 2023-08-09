import express, { Request, Response, NextFunction } from 'express';
const app = express();

app.use(express.json()); 

app.use(globalErrorHandler);

// move to separate file
class ErrorObj {
  private location: string
  private serverMsg: string
  errorCode: number
  private clientMsg: string
  
  constructor (
    location: string,
    serverMsg: string,
    errorCode: number,
    clientMsg: string
  ) {
    this.location = location;
    this.serverMsg = serverMsg;
    this.errorCode = errorCode === undefined ? 500 : errorCode;
    if (!clientMsg) {
      this.clientMsg = 'An unknown error occurred.'
    } else {
      this.clientMsg = clientMsg;
    }
  }
  
  getClientMessage(): string {
    return this.clientMsg;
  }
  
  getServerMessage(): string {
    return `Error in ${this.location}; ${this.serverMsg}`;
  }
}

function globalErrorHandler (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
};

const PORT = 3000;
app.listen(PORT, () => { console.log(`listening on ${PORT}`); });

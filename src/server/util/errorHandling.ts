export default class ErrorObj {
  private location: string
  private serverMsg: string
  errorCode: number
  private clientMsg: string
  
  constructor (
    location: string,
    serverMsg: string,
    errorCode?: number,
    clientMsg?: string
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

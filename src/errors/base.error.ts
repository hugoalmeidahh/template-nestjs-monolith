export abstract class BaseError extends Error {
  abstract httpCode: number;
  abstract message: string;

  public getStatus() {
    return this.httpCode;
  }

  public getMessage() {
    return this.message.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  }
}

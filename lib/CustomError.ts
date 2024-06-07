export class CustomError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "CustomError";
    this.details = details;
  }
}

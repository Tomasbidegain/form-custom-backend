export class AppBusinessError extends Error {
  code: string;
  details?: any;

  constructor(code: string, details?: any) {
    super(code);
    this.code = code;
    this.details = details;
    this.name = "AppBusinessError";
  }
}
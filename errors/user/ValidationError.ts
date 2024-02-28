import CustomError from "../CustomError";

export default class ValidationError extends CustomError {
  public errors: any[];

  constructor(errors: any[]) {
    super("Validation failed", 422);
    this.errors = errors;
  }
}

import CustomError from "../CustomError";

export default class UnauthorizedError extends CustomError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

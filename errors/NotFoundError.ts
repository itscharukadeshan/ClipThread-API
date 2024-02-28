import CustomError from "./CustomError";

export default class NotFoundError extends CustomError {
  constructor(message: string = "Not found") {
    super(message, 404);
  }
}

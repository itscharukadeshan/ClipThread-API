import CustomError from "./CustomError";

export default class UserAlreadyExistsError extends CustomError {
  constructor(message: string = "User already exists") {
    super(message, 409);
  }
}

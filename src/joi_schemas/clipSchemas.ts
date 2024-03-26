import Joi from "joi";

const authHeaderSchema = Joi.string()
  .trim()
  .pattern(/^Bearer [a-zA-Z0-9\\-_]+$/)
  .error(new Error("Invalid authorization header"));

export const validateHeaders = (authHeader: string) => {
  return authHeaderSchema.validate(authHeader);
};

import Joi from "joi";

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .pattern(/^([a-zA-Z0-9\-_]+\.){2}[a-zA-Z0-9\-_]+$/)
    .error(new Error("Invalid or missing refresh token")),
});
export const accessTokenSchema = Joi.string()
  .trim()
  .pattern(/^(Bearer|bearer) [a-zA-Z0-9\\-_]+$/)
  .required()
  .error(new Error("Invalid or missing access token"));

export const querySchema = Joi.object({
  code: Joi.string().required(),
  scope: Joi.string().required(),
});

import Joi from "joi";

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .pattern(/^([a-zA-Z0-9\-_]+\.){2}[a-zA-Z0-9\-_]+$/),
});
export const accessTokenSchema = Joi.string().required();

export const querySchema = Joi.object({
  code: Joi.string().required(),
  scope: Joi.string().required(),
});

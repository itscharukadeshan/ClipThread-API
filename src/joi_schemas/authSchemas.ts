import Joi from "joi";

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});
export const accessTokenSchema = Joi.string().required();

export const querySchema = Joi.object({
  code: Joi.string().required(),
  scope: Joi.string().required(),
});

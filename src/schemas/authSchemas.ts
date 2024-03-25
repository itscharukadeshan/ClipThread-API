import Joi from "joi";
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().pattern(
    /^([a-zA-Z0-9\-_]+\.){2}[a-zA-Z0-9\-_]+$/
  ),
});

export const authSchemas = Joi.object({});

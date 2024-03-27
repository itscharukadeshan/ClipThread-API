import Joi from "joi";

export const roleSchemas = Joi.object({
  code: Joi.string().valid("user", "moderator", "creator").required(),
});

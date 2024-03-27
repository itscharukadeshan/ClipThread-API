import Joi from "joi";

export const roleSchema = Joi.object({
  code: Joi.string().valid("user", "moderator", "creator").required(),
});

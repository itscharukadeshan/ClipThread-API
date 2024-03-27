import Joi from "joi";
export const userIdSchema = Joi.object({
  userId: Joi.string().required(),
});

import Joi from "joi";

export const urlSchema = Joi.object({
  url: Joi.string().uri().required().error(new Error("Invalid or missing url")),
});

import Joi from "joi";

export const urlSchema = Joi.string()
  .uri()
  .required()
  .error(new Error("Invalid or missing url"));

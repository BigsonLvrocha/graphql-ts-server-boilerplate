import * as yup from "yup";

export const RegisterPasswordValidation = yup
  .string()
  .min(3)
  .max(255)
  .required();

import { ValidationError } from "yup";

export const formatYupError = (
  err: ValidationError
): Array<{
  path: string;
  message: string;
}> => [
  ...err.inner.map(item => ({
    path: item.path,
    message: item.message
  }))
];

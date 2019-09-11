import { IResolvers } from "graphql-tools";
import { User } from "../../entity/User";
import * as yup from "yup";
import { formatYupError } from "../../utils/formatYupError";
import { duplicateEmail } from "./errorMessages";
import { Redis } from "ioredis";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLinks";
import { sendEmail } from "../../utils/sendEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3)
    .max(255)
    .email()
    .required(),
  password: yup
    .string()
    .min(3)
    .max(255)
    .required()
});

export const resolvers: IResolvers = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }: { redis: Redis; url: string }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err as yup.ValidationError);
      }
      const { email, password } = args;
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }
      const user = User.create({
        email,
        password
      });
      await user.save();
      if (process.env.NODE_ENV !== "test") {
        await sendEmail(
          email,
          await createConfirmEmailLink(url, user.id, redis)
        );
      }
      return null;
    }
  },
  Query: {
    bye: () => "bye"
  }
};

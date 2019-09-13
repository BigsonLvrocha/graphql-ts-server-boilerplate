import * as yup from "yup";
import * as bcrypt from "bcryptjs";
import { ResolverMap } from "../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { createFotgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { User } from "../../entity/User";
import { userNotfoundError, expiredKeyError } from "./errorMessages";
import { forgotPasswordPrefix } from "../../constants";
import { RegisterPasswordValidation } from "../../yupSchemas";
import { formatYupError } from "../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: RegisterPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotfoundError
          }
        ];
      }
      await forgotPasswordLockAccount(user.id, redis);
      // @todo add frontend url
      await createFotgotPasswordLink("", user.id, redis);
      // @todo send email with url
      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(`${forgotPasswordPrefix}${key}`);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError
          }
        ];
      }
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        { forgotPasswordLocked: false, password: hashedPassword }
      );

      const deletePromise = redis.del(`${forgotPasswordPrefix}${key}`);

      await Promise.all([updatePromise, deletePromise]);

      return null;
    }
  },
  Query: {
    dummy2: () => "bye"
  }
};

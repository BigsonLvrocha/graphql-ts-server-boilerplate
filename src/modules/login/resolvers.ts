import { User } from "../../entity/User";
import {
  invalidLogin,
  confirmEmailError,
  lockedAccountError
} from "./errorMessages";
import * as bcrypt from "bcryptjs";
import { ResolverMap } from "../../types/graphql-utils";
import { userSessionIdPrefix } from "../../constants";

const errorResponse = {
  path: "email",
  message: invalidLogin
};

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [errorResponse];
      }
      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError
          }
        ];
      }
      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: lockedAccountError
          }
        ];
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return [errorResponse];
      }
      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);
      }
      return null;
    }
  },
  Query: {
    bye2: () => "bye"
  }
};

import { User } from "../../entity/User";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import * as bcrypt from "bcryptjs";
import { ResolverMap } from "../../types/graphql-utils";

const errorResponse = {
  path: "email",
  message: invalidLogin
};

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
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
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return [errorResponse];
      }
      session.userId = user.id;
      return null;
    }
  },
  Query: {
    bye2: () => "bye"
  }
};

import { IResolvers } from "graphql-tools";
import { User } from "../../entity/User";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import * as bcrypt from "bcryptjs";

const errorResponse = {
  path: "email",
  message: invalidLogin
};

export const resolvers: IResolvers = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
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
      return null;
    }
  },
  Query: {
    bye2: () => "bye"
  }
};

import { IResolvers } from "graphql-tools";
import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";

export const resolvers: IResolvers = {
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });
      await user.save();
      return true;
    }
  },
  Query: {
    bye: () => "bye"
  }
};
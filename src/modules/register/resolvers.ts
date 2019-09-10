import { IResolvers } from "graphql-tools";
import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";

export const resolvers: IResolvers = {
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: "already taken"
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });
      await user.save();
      return null;
    }
  },
  Query: {
    bye: () => "bye"
  }
};

import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Mutation: {
    forgotPasswordChange: async () => {
      return null;
    }
  },
  Query: {
    dummy2: () => "bye"
  }
};

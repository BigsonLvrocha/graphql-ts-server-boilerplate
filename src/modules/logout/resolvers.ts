import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy"
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise((resolve, reject) =>
        session.destroy(err => {
          if (err) {
            console.log("lougout error: ", err);
            reject(err);
            return;
          }
          resolve(true);
        })
      )
  }
};

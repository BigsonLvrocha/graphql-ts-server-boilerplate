import { ResolverMap } from "../../types/graphql-utils";
import { removeAllUserSessions } from "../../utils/removeAllUserSessions";

export const resolvers: ResolverMap = {
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      const { userId } = session;
      if (!userId) {
        return false;
      }
      await removeAllUserSessions(userId, redis);
      await new Promise((resolve, reject) =>
        session.destroy(err => {
          if (err) {
            console.log(err);
            reject(err);
            return;
          }
          resolve();
        })
      );
      return true;
    }
  }
};

import { Resolver } from "../../types/graphql-utils";

export const middleware = async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  if (!context.session || !context.session.userId) {
    return null;
  }
  const result = await resolver(parent, args, context, info);
  // afterware
  return result;
};

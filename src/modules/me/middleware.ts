import { Resolver } from "../../types/graphql-utils";
import { logger } from "../../utils/logger";

export const middleware = async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  logger(parent, args, context, info);
  console.log("args given:", args);
  if (!context.session || !context.session.userId) {
    throw Error("no cookie");
  }
  const result = await resolver(parent, args, context, info);
  // afterware
  console.log("result: ", result);
  return result;
};

import { IResolvers } from "graphql-tools";

export const resolvers: IResolvers = {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  }
};

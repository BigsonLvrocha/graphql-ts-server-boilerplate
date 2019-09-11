import { GraphQLServer } from "graphql-yoga";
import { createTypeOrmConn } from "./utils/createTypesOrmConn";
import { redis } from "./services/redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";

export const startServer = async () => {
  const schema = genSchema();
  const server = new GraphQLServer({
    schema,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host")
    })
  });
  server.express.get("/confirm/:id", confirmEmail);
  await createTypeOrmConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};

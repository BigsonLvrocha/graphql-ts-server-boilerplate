import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import * as ConnectRedis from "connect-redis";
import * as Redis from "redis";
import { createTypeOrmConn } from "./utils/createTypesOrmConn";
import { redis } from "./services/redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";

export const startServer = async () => {
  const schema = genSchema();
  const server = new GraphQLServer({
    schema,
    context: ({ request }) => {
      return {
        redis,
        url: request.protocol + "://" + request.get("host"),
        session: request.session
      };
    }
  });
  server.express.use(
    session({
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store: new (ConnectRedis(session))({
        client: Redis.createClient()
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7
      }
    })
  );
  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV !== "production"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };
  server.express.get("/confirm/:id", confirmEmail);
  await createTypeOrmConn();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};

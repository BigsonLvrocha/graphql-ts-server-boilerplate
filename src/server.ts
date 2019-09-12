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
import { redisSessionPrefix } from "./constants";
import * as RateLimit from "express-rate-limit";
import * as RedisStoreLimit from "rate-limit-redis";
import * as Passport from "passport";
import { Strategy } from "passport-twitter";
import { User } from "./entity/User";
import { createTestConn } from "../__tests__/utils/createTestConnection";

const RedisStore = ConnectRedis(session);
export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    redis.flushall();
  }
  const schema = genSchema();
  const server = new GraphQLServer({
    schema,
    context: ({ request }) => {
      return {
        redis,
        url: request.protocol + "://" + request.get("host"),
        session: request.session,
        req: request
      };
    }
  });
  server.express.use(
    new RateLimit({
      store: new RedisStoreLimit({
        client: redis
      }),
      windowMs: 15 * 60 * 1000,
      max: 100
    })
  );
  server.express.use(
    session({
      name: "qid",
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({
        client: Redis.createClient(),
        prefix: redisSessionPrefix
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
  if (process.env.NODE_ENV === "test") {
    await createTestConn(true);
  } else {
    await createTypeOrmConn();
  }
  Passport.use(
    new Strategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
        callbackURL: "http://localhost:4000/auth/twitter/callback",
        includeEmail: true
      },
      async (_, __, profile, cb) => {
        const { id, emails } = profile;
        let email: string | null = null;
        const query = User.createQueryBuilder().where("user.twitterId = :id", {
          id
        });
        if (emails) {
          email = emails[0].value;
          query.orWhere("user.email = :email", { email });
        }
        let user = await query.getOne();
        // this user needs to be created
        if (!user) {
          user = await User.create({
            twitterId: id,
            email
          }).save();
        } else if (!user.twitterId) {
          user.twitterId = id;
          await user.save();
        }
        return cb(null, { id: user.id });
      }
    )
  );
  server.express.use(Passport.initialize());
  server.express.get("/auth/twitter", Passport.authenticate("twitter"));
  server.express.get(
    "/auth/twitter/callback",
    Passport.authenticate("twitter", { session: false }),
    (req, res) => {
      req.session!.userId = (req.user as any).id;
      // @todo redirect to frontend
      res.redirect("/");
    }
  );
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};

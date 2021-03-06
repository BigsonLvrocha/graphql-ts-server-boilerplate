import { Redis } from "ioredis";
import { Request } from "express";

export interface Session extends Express.Session {
  userId?: string;
}

export interface Context {
  redis: Redis;
  url: string;
  session: Session;
  req: Express.Request;
}

export type Resolver = (
  parent: any,
  agrs: any,
  context: Context,
  info: any
) => any;

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  agrs: any,
  context: Context,
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}

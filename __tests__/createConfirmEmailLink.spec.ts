import { createConfirmEmailLink } from "../src/utils/createConfirmEmailLinks";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import * as Redis from "ioredis";
import { default as fetch } from "node-fetch";

let userId = "";
const redis = new Redis({
  host: "0.0.0.0"
});

describe("create confirm link", () => {
  beforeAll(async () => {
    await createTypeOrmConn();
    const user = await User.create({
      email: "box5@bob.com",
      password: "açshfqnrçvh"
    }).save();
    userId = user.id;
  });
  it("should create a valid link", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    );
    const response = await fetch(url);
    const text = await response.text();
    expect(text).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      expect(user.confirmed).toBeTruthy();
    } else {
      fail("should have the user in database");
    }
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });

  it("should reject bad id", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/1230875434`);
    const text = await response.text();
    expect(text).toEqual("error");
  });
});

import { createConfirmEmailLink } from "../src/utils/createConfirmEmailLinks";
import { createTestConn } from "./utils/createTestConnection";
import { User } from "../src/entity/User";
import { redis } from "../src/services/redis";
import { default as fetch } from "node-fetch";
import { Connection } from "typeorm";
import * as faker from "faker";

let userId = "";
let conn: Connection;

describe("create confirm link", () => {
  beforeAll(async () => {
    conn = await createTestConn();
    const user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password()
    }).save();
    userId = user.id;
  });

  afterAll(async () => {
    await conn.close();
  });

  it("creates a valid link", async () => {
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
});

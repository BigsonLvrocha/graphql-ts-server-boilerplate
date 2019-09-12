import { Connection } from "typeorm";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";
import { createFotgotPasswordLink } from "../src/utils/createForgotPasswordLink";
import { redis } from "../src/services/redis";

const email = "tom@bob.com";
const password = "asdf";
const newPassword = "asdfasdf";
let userId: string;
let conn: Connection;

describe("ForgotPasswordModule", () => {
  beforeAll(async () => {
    conn = await createTypeOrmConn();
  });

  beforeEach(async () => {
    await User.createQueryBuilder()
      .delete()
      .execute();
    const user = await User.create({
      email,
      password,
      confirmed: true
    }).save();
    userId = user.id;
  });

  afterAll(async () => {
    conn.close();
  });

  it("changes password on request", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const url = await createFotgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];
    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });
    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});

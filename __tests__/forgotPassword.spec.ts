import { Connection } from "typeorm";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";
import { createFotgotPasswordLink } from "../src/utils/createForgotPasswordLink";
import { forgotPasswordLockAccount } from "../src/utils/forgotPasswordLockAccount";
import { lockedAccountError } from "../src/modules/login/errorMessages";
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
    // lock account
    await forgotPasswordLockAccount(userId, redis);
    const url = await createFotgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: lockedAccountError
          }
        ]
      }
    });
    const response = await client.forgotPasswordChange("a", key);
    expect(response.data.forgotPasswordChange).toHaveLength(1);
    expect(response.data.forgotPasswordChange[0].path).toEqual("newPassword");
    expect(response.data.forgotPasswordChange[0]).toHaveProperty("message");
    const response1 = await client.forgotPasswordChange(newPassword, key);
    expect(response1.data).toEqual({
      forgotPasswordChange: null
    });
    const response2 = await client.forgotPasswordChange(
      "çasldkhfçasolidrfh",
      key
    );
    expect(response2.data.forgotPasswordChange).toHaveLength(1);
    expect(response2.data.forgotPasswordChange[0].path).toEqual("key");
    expect(response2.data.forgotPasswordChange[0]).toHaveProperty("message");
    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});

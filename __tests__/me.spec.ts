import { Connection } from "typeorm";
import { createTestConn } from "./utils/createTestConnection";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";
import * as faker from "faker";

faker.seed(Date.now() + 4)
const email = faker.internet.email();
const password = faker.internet.password();
let conn: Connection;
let userId: string;

describe("me module", () => {
  beforeAll(async () => {
    conn = await createTestConn();
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
  // it("can't get user if not logged in", async () => {
  // later
  // });

  it("gets current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });

  it("returns null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });
});

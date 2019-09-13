import { Connection } from "typeorm";
import { createTestConn } from "./utils/createTestConnection";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";
import * as faker from "faker";
let conn: Connection;

describe("logout module", () => {
  beforeAll(async () => {
    conn = await createTestConn();
  });

  afterAll(async () => {
    conn.close();
  });

  test("multiple sesison", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
    const sess1 = new TestClient(process.env.TEST_HOST as string);
    const sess2 = new TestClient(process.env.TEST_HOST as string);

    await sess1.login(email, password);
    await sess2.login(email, password);
    expect(await sess1.me()).toEqual(await sess2.me());
    await sess1.logout();
    const me1 = await sess1.me();
    const me2 = await sess2.me();
    expect(me1).toEqual(me2);
  });

  it("logs out single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const email = faker.internet.email();
    const password = faker.internet.password();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
    await client.login(email, password);
    const response = await client.me();
    const response1 = await client.logout();
    const response2 = await client.me();
    expect(response.data.me).toHaveProperty("id");
    expect(response.data.me).toHaveProperty("email");
    expect(response1.data.logout).toBeTruthy();
    expect(response2.data.me).toBeNull();
  });

  it("accepts empty cookie request", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response1 = await client.logout();
    expect(response1.data.logout).toBeFalsy();
  });
});

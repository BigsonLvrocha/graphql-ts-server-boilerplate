import { Connection } from "typeorm";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";

const email = "tom@bob.com";
const password = "asdf";
let conn: Connection;

describe("logout module", () => {
  beforeAll(async () => {
    conn = await createTypeOrmConn();
    await User.createQueryBuilder()
      .delete()
      .execute();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
  });

  afterAll(async () => {
    conn.close();
  });

  it("logs out current user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
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
    expect(response1.data.logout).toBeTruthy();
  });
});

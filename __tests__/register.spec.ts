import { User } from "../src/entity/User";
import { duplicateEmail } from "../src/modules/register/errorMessages";
import { createTestConn } from "./utils/createTestConnection";
import { Connection } from "typeorm";
import { TestClient } from "./utils/testClient";
import * as faker from "faker";

faker.seed(Date.now() + 5);
const email = faker.internet.email();
const password = faker.internet.password();
let conn: Connection;
describe("Registration object", () => {
  beforeAll(async () => {
    conn = await createTestConn();
  });

  afterAll(async () => {
    conn.close();
  });

  it("registers correct user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, password);
    expect(response.data).toEqual({
      register: null
    });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.password).not.toEqual(password);
  });

  it("returns error on duplicate emails", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);
    const response = await client.register(email, password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0].path).toEqual("email");
    expect(response.data.register[0].message).toEqual(duplicateEmail);
  });

  it("returns error on invalid email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register("aaasdfasd", password);
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0].path).toEqual("email");
  });

  it("returns error on short email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register("aa", password);
    expect(response.data.register).toHaveLength(2);
  });

  it("returns error on short password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.register(email, "aa");
    expect(response.data.register).toHaveLength(1);
    expect(response.data.register[0].path).toEqual("password");
  });
});

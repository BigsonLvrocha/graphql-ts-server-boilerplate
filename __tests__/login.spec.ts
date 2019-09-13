import { User } from "../src/entity/User";
import { createTestConn } from "./utils/createTestConnection";
import {
  invalidLogin,
  confirmEmailError
} from "../src/modules/login/errorMessages";
import { Connection } from "typeorm";
import { TestClient } from "./utils/testClient";
import * as faker from "faker";

faker.seed(Date.now() + 2);
let conn: Connection;
describe("login module", () => {
  beforeAll(async () => {
    conn = await createTestConn();
  });

  afterAll(async () => {
    conn.close();
  });

  it("returns error on invalid email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.login(
      faker.internet.email(),
      faker.internet.password()
    );
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: invalidLogin
        }
      ]
    });
  });

  it("returns error on unconfirmed account", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    await User.create({
      email,
      password
    }).save();
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: confirmEmailError
        }
      ]
    });
  });

  it("returns error on wrong password", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.login(email, "lairubgrçei8g");
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: invalidLogin
        }
      ]
    });
  });
  it("returns null on correct login", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.login(email, password);
    expect(response.data).toEqual({
      login: null
    });
  });
});

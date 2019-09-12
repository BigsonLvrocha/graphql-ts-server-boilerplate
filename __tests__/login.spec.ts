import { User } from "../src/entity/User";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import {
  invalidLogin,
  confirmEmailError
} from "../src/modules/login/errorMessages";
import { Connection } from "typeorm";
import { TestClient } from "./utils/testClient";

const email = "tom@bob.com";
const password = "asdf";
let conn: Connection;
describe("login module", () => {
  beforeAll(async () => {
    conn = await createTypeOrmConn();
  });

  beforeEach(async () => {
    await User.createQueryBuilder()
      .delete()
      .execute();
  });

  afterAll(async () => {
    conn.close();
  });

  it("returns error on invalid email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.login(email, password);
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

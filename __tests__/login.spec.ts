import { request } from "graphql-request";
import { User } from "../src/entity/User";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import {
  invalidLogin,
  confirmEmailError
} from "../src/modules/login/errorMessages";
import { Connection } from "typeorm";

const email = "tom@bob.com";
const password = "asdf";
const makeLoginMutation = (customEmail: string, customPassword: string) => `
  mutation {
    login(email: "${customEmail}", password: "${customPassword}") {
      path
      message
    }
  }
`;
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
    const response = await request(
      process.env.TEST_HOST as string,
      makeLoginMutation(email, password)
    );
    expect(response).toEqual({
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
    const response = await request(
      process.env.TEST_HOST as string,
      makeLoginMutation(email, password)
    );
    expect(response).toEqual({
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
    const response = await request(
      process.env.TEST_HOST as string,
      makeLoginMutation(email, "lairubgrçei8g")
    );
    expect(response).toEqual({
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
    const response = await request(
      process.env.TEST_HOST as string,
      makeLoginMutation(email, password)
    );
    expect(response).toEqual({
      login: null
    });
  });
});

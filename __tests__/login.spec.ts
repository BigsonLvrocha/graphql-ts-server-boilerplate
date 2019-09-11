import { request } from "graphql-request";
import { User } from "../src/entity/User";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import {
  invalidLogin,
  confirmEmailError
} from "../src/modules/login/errorMessages";
import * as bcrypt from "bcryptjs";

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

describe("login module", () => {
  beforeAll(async () => {
    await createTypeOrmConn();
  });

  beforeEach(async () => {
    await User.createQueryBuilder()
      .delete()
      .execute();
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
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
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
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

import { request } from "graphql-request";
import { User } from "../src/entity/User";
import { duplicateEmail } from "../src/modules/register/errorMessages";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";

const email = "toma@bob.com";
const password = "asdf";
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;
const getCustomMutation = (customEmail: string, customPassword: string) => `
  mutation {
    register(email: "${customEmail}", password: "${customPassword}") {
      path
      message
    }
  }
`;

describe("Registration object", () => {
  beforeAll(async () => {
    await createTypeOrmConn();
  });

  beforeEach(async () => {
    await User.createQueryBuilder()
      .delete()
      .execute();
  });

  it("should register user", async () => {
    const response = await request(process.env.TEST_HOST as string, mutation);
    expect(response).toEqual({
      register: null
    });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.password).not.toEqual(password);
  });

  it("should return error on duplicate emails", async () => {
    await request(process.env.TEST_HOST as string, mutation);
    const response = (await request(
      process.env.TEST_HOST as string,
      mutation
    )) as any;
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("email");
    expect(response.register[0].message).toEqual(duplicateEmail);
  });

  it("should return error on invalid email", async () => {
    const customEmail = "aaasdfasd";
    const response = await request(
      process.env.TEST_HOST as string,
      getCustomMutation(customEmail, password)
    );
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("email");
  });

  it("should return error on short email", async () => {
    const customEmail = "aa";
    const response = await request(
      process.env.TEST_HOST as string,
      getCustomMutation(customEmail, password)
    );
    expect(response.register).toHaveLength(2);
  });

  it("should return error on short password", async () => {
    const customPassword = "12";
    const response = await request(
      process.env.TEST_HOST as string,
      getCustomMutation(email, customPassword)
    );
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("password");
  });
});

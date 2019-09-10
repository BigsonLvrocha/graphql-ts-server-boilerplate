import { request } from "graphql-request";
import { User } from "../src/entity/User";
import { startServer } from "../src/server";
import { AddressInfo } from "net";
import { duplicateEmail } from "../src/modules/register/errorMessages";

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
let getHost = () => "";

describe("Registration object", () => {
  beforeAll(async () => {
    const app = await startServer();
    const { port } = app.address() as AddressInfo;
    getHost = () => `http://127.0.0.1:${port}`;
  });

  beforeEach(async () => {
    await User.createQueryBuilder()
      .delete()
      .execute();
  });

  it("should register user", async () => {
    const response = await request(getHost(), mutation);
    expect(response).toEqual({
      register: null
    });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.password).not.toEqual(password);
  });

  it("should return error on duplicate emails", async () => {
    await request(getHost(), mutation);
    const response = (await request(getHost(), mutation)) as any;
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("email");
    expect(response.register[0].message).toEqual(duplicateEmail);
  });

  it("should return error on invalid email", async () => {
    const customEmail = "aaasdfasd";
    const response = await request(
      getHost(),
      getCustomMutation(customEmail, password)
    );
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("email");
  });

  it("should return error on short email", async () => {
    const customEmail = "aa";
    const response = await request(
      getHost(),
      getCustomMutation(customEmail, password)
    );
    expect(response.register).toHaveLength(2);
  });

  it("should return error on short password", async () => {
    const customPassword = "12";
    const response = await request(
      getHost(),
      getCustomMutation(email, customPassword)
    );
    expect(response.register).toHaveLength(1);
    expect(response.register[0].path).toEqual("password");
  });
});

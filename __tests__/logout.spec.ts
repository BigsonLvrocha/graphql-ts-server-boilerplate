import { Connection } from "typeorm";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import Axios from "axios";

const email = "tom@bob.com";
const password = "asdf";
const axiosClient = Axios.create({
  baseURL: process.env.TEST_HOST as string,
  withCredentials: true
});
const makeLoginMutation = (customEmail: string, customPassword: string) => `
  mutation {
    login(email: "${customEmail}", password: "${customPassword}") {
      path
      message
    }
  }
`;
const logoutMutation = `
mutation {
  logout
}
`;
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
  // it("can't get user if not logged in", async () => {
  // later
  // });

  it("logs out current user", async () => {
    const response1 = await axiosClient.post(process.env.TEST_HOST as string, {
      query: makeLoginMutation(email, password)
    });
    const Cookie = response1.headers["set-cookie"][0];
    const response = await axiosClient.post(
      "/",
      {
        query: logoutMutation
      },
      {
        headers: {
          Cookie
        }
      }
    );
    expect(response.data.data).toEqual({
      logout: true
    });
    console.log(response.headers);
  });

  it("accepts empty cookie request", async () => {
    const response = await axiosClient.post("/", {
      query: logoutMutation
    });
    expect(response.data.data).toEqual({
      logout: true
    });
    console.log(response.headers);
  });
});

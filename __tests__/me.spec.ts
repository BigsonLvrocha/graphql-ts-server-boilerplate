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
const meQuery = `{
  me {
    id
    email
  }
}`;
let conn: Connection;
let userId: string;

describe("me module", () => {
  beforeAll(async () => {
    conn = await createTypeOrmConn();
    await User.createQueryBuilder()
      .delete()
      .execute();
    const user = await User.create({
      email,
      password,
      confirmed: true
    }).save();
    userId = user.id;
  });

  afterAll(async () => {
    conn.close();
  });
  // it("can't get user if not logged in", async () => {
  // later
  // });

  it("gets current user", async () => {
    const response1 = await axiosClient.post(process.env.TEST_HOST as string, {
      query: makeLoginMutation(email, password)
    });
    const Cookie = response1.headers["set-cookie"][0];
    const response = await axiosClient.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      {
        headers: {
          Cookie
        }
      }
    );
    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });

  it("returns null if no cookie", async () => {
    const response = await axiosClient.post(process.env.TEST_HOST as string, {
      query: meQuery
    });
    expect(response.data.data.me).toBeNull();
  });
});

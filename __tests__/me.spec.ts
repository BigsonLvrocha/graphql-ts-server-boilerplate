import { Connection } from "typeorm";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";
import { User } from "../src/entity/User";
import { TestClient } from "./utils/testClient";

const email = "tom@bob.com";
const password = "asdf";
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
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });

  it("returns null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });
});

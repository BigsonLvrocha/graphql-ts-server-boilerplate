import { request } from "graphql-request";
import { User } from "../src/entity/User";
import { startServer } from "../src/server";
import { AddressInfo } from "net";

const email = "toma@bob.com";
const password = "asdf";
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;
let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.password).not.toEqual(password);
});

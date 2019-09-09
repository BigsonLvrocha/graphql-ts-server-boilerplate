import { request } from "graphql-request";
import { host } from "../src/types/constants";
import { User } from "../src/entity/User";
import { createTypeOrmConn } from "../src/utils/createTypesOrmConn";

const email = "toma@bob.com";
const password = "asdf";
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;

beforeAll(async () => {
  await createTypeOrmConn();
});

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.password).not.toEqual(password);
});

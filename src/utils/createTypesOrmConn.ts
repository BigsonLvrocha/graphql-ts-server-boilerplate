import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeOrmConn = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  const connection = await createConnection({
    ...connectionOptions,
    name: "default"
  });
  return connection;
};

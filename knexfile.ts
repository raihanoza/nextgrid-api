import { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const connection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
};

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: connection,
    migrations: {
      tableName: "migrations",
      directory: "./src/app/database/migrations",
    },
    seeds: {
      directory: "./src/app/database/seeds",
    },
  },
};

export default knexConfig;

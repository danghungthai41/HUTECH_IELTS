import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const db = connectionString
  ? drizzle(mysql.createPool(connectionString), { schema, mode: "default" })
  : new Proxy({} as any, {
      get() {
        throw new Error("DATABASE_URL is not defined. Please set it in your environment variables.");
      },
    });


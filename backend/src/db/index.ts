import 'dotenv/config';
import { Pool } from "pg"
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./schema.ts"
import { ENV } from "../config/env.ts";

if (!ENV.DB_URL) {
    throw new Error("Database URL is not defined in the environment variables.");
}

// initialize the drizzle ORM with the PostgreSQL pool
const pool = new Pool({ connectionString: ENV.DB_URL });

// log the database connection status
pool.on('connect', () => {
    console.log('Connected to the database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export const db = drizzle({client: pool, schema});


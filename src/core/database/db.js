import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.POSTGRESQL_USER,
    host: process.env.POSTGRESQL_HOST,
    database: process.env.POSTGRESQL_DATABASE,
    password: process.env.POSTGRESQL_PASSWORD,
    port: process.env.POSTGRESQL_PORT,
    ssl: process.env.SYSTEM_ENVIRONMENT === "production" ? { rejectUnauthorized: false } : false
});

export const dbExecute = async (query, params = []) => {
    try {
        const result = await pool.query(query, params);
        return { rows: result.rows, dbError: null }
    } catch (error) {
        return { rows: null, dbError: error};
    };
};
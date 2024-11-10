import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

var pool = '';

if (process.env.SYSTEM_ENVIRONMENT === "staging") {
    pool = new pg.Pool({
        user: process.env.POSTGRESQL_USER,
        host: process.env.POSTGRESQL_HOST,
        database: process.env.POSTGRESQL_DATABASE,
        password: process.env.POSTGRESQL_PASSWORD,
        port: process.env.POSTGRESQL_PORT
    });
} else if (process.env.SYSTEM_ENVIRONMENT === "production") {
    pool = new pg.Pool({
        user: process.env.POSTGRESQL_USER,
        host: process.env.POSTGRESQL_HOST,
        database: process.env.POSTGRESQL_DATABASE,
        password: process.env.POSTGRESQL_PASSWORD,
        port: process.env.POSTGRESQL_PORT,
        ssl: {
            rejectUnauthorized: false
        }
    });
};

export const dbExecute = (query, params = []) => {
    return new Promise((response) => {
        pool.query(query, params, (error, result) => {
            if (error) {
                const errorContent = {};
                errorContent.dbError = error;
                response(errorContent);
            } else {
                response(result);
            }
        });
    });
};
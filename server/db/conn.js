import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;


if (!connectionString) {
    throw new Error("There is an error in connecting to the database");
}

const sql = postgres(connectionString);

export default sql;
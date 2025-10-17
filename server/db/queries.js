import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

const createUser = async (name, email, password, role) => {
    const ROLE = role.toLowerCase();
    try {
        const res = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name}, ${email}, ${password}, ${ROLE})
        RETURNING id, name, email
    `;
        if (!res) {
            return "error";
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return "error";
    }
    return "success";
}


const getUserCredentials = async (email) => {
    try {
        const user = await sql`
        SELECT *
        FROM users
        WHERE email = ${email} LIMIT 1
    `;
        if (user) return user[0];
    }
    catch (error) {
        console.error("Error fetching user credentials:", error);
        return null;
    }
    return null;
}
export const queries = { getUserCredentials, createUser };

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
        return "success";
    } catch (error) {
        console.error("Error creating user:", error);
        return "error";
    }
};


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

};

const getAllEvents = async () => {
    try {
        const events = await sql`
        SELECT *
        FROM events
    `;
        return events;
    } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
    }
};

const createEvent = async (title, description, date, location, organizerId) => {
    if (!title || !description || !date || !location || !organizerId) {
        return null;
    }
    try {
        const res = await sql`
        INSERT INTO events (title, description, date, location, organizer_id)
        VALUES (${title}, ${description}, ${date}, ${location}, ${organizerId})
        RETURNING id, title, description, date, location, organizer_id
    `;
        return res;
    } catch (error) {
        console.error("Error creating event:", error);
        return null;
    }
};

const getEventById = async (id) => {
    try {
        const event = await sql`
        SELECT *
        FROM events
        WHERE id = ${id}
    `;
        return event[0];
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        return null;
    }
};

const updateEvent = async (id, title, description, date, location) => {
    try {
        const res = await sql`
        UPDATE events
        SET title = ${title}, description = ${description}, date = ${date}, location = ${location}
        WHERE id = ${id}
        RETURNING id, title, description, date, location
    `;
        return res;
    } catch (error) {
        console.error("Error updating event:", error);
        return null;
    }
};

const deleteEvent = async (id) => {
    try {
        await sql`
        DELETE FROM events
        WHERE id = ${id}
    `;
        return "success";
    }
    catch (error) {
        console.error("Error deleting event:", error);
        return null;
    }
};

export const queries = { getUserCredentials, createUser, getAllEvents, createEvent, updateEvent, deleteEvent, getEventById };

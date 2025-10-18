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
        if (error.code === '23505') {
            return { error: "email already exists" };
        }
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

    const event_id = parseInt(id);

    if (isNaN(event_id) || event_id <= 0) {
        return null;
    }

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

const addTickets = async (event_id, type, price, quantity) => {
    try {
        const hasFree = await sql`
        SELECT *
        FROM tickets
        WHERE event_id = ${event_id} AND type = 'free'
    `;
        const hasPaid = await sql` 
        SELECT *
        FROM tickets
        WHERE event_id = ${event_id} AND type = 'paid'
    `;
        if (hasFree.length > 0 && type === 'free') {
            return { message: "You have already added free tickets for this event." };
        }

        if (hasPaid.length > 0 && type === 'paid') {
            return { message: "You have already added paid tickets for this event." };
        }

        if (hasFree.length > 0 && hasPaid.length > 0) {
            return { message: "You have already added both free and paid tickets for this event." };
        }
        const res = await sql`
        INSERT INTO tickets (event_id, type, price, quantity)
        VALUES (${event_id}, ${type}, ${price}, ${quantity})
        RETURNING id, event_id, type, price, quantity
    `;
        return res;
    } catch (error) {
        console.error("Error adding tickets:", error);
        return null;
    }
};


const updateTickets = async (event_id, type, price, quantity) => {
    try {
        const res = await sql`
        UPDATE tickets
        SET price = ${price}, quantity = ${quantity}
        WHERE event_id = ${event_id} AND type = ${type}
        RETURNING id, event_id, type, price, quantity
    `;
        return res;
    } catch (error) {
        console.error("Error updating tickets:", error);
        return null;
    }
};


const deleteTickets = async (event_id, ticketId) => {
    try {
        await sql`
        DELETE FROM tickets
        WHERE event_id = ${event_id} AND id = ${ticketId}
    `;
        return "success";
    } catch (error) {
        console.error("Error deleting tickets:", error);
        return null;
    }
};

const getTickets = async (event_id) => {
    try {
        const tickets = await sql`
        SELECT *
        FROM tickets
        WHERE event_id = ${event_id}
    `;
        return tickets;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return null;
    }
};


const createEventRsvp = async (event_id, user_id, ticket_type) => {
    try {
        const result = await sql.begin(async (sql) => {
            const ticket = await sql`
            SELECT *
            FROM tickets
            WHERE event_id = ${event_id} AND type = ${ticket_type}
            FOR UPDATE
        `;

            if (ticket.length === 0) {
                return { error: "Ticket not found." };
            }
            if (ticket[0].quantity === 0) {
                return { error: "No tickets available for the selected type." };
            }

            const existing = await sql`
                SELECT * FROM rsvps 
                WHERE event_id = ${event_id} 
                AND user_id = ${user_id} 
                AND status = 'confirmed'
                LIMIT 1
            `;

            if (existing.length > 0) {
                return { error: "You have already RSVP'd for this event." };
            }

            await sql`
                UPDATE tickets 
                SET quantity = quantity - 1
                WHERE event_id = ${event_id} AND type = ${ticket_type}
            `;

            const rsvp = await sql`
            INSERT INTO rsvps (event_id, user_id, ticket_type)
            VALUES (${event_id}, ${user_id}, ${ticket_type})
            RETURNING id, event_id, user_id, ticket_type, status, created_at
        `;
            return rsvp[0];
        });
        return result;
    } catch (error) {
        console.error("Error creating RSVP:", error);
        throw error;
    }
};

const cancelRsvp = async (rsvpId, userId) => {
    try {
        const result = await sql.begin(async (sql) => {
            const rsvp = await sql`
                SELECT *
                FROM rsvps
                WHERE id = ${rsvpId} AND user_id = ${userId} AND status = 'confirmed'
                LIMIT 1
            `;

            if (rsvp.length === 0) {
                return "not_found";
            }

            await sql`
                UPDATE rsvps 
                SET status = 'cancelled'
                WHERE id = ${rsvpId}
            `;

            await sql`
                UPDATE tickets 
                SET quantity = quantity + 1
                WHERE event_id = ${rsvp[0].event_id} 
                AND type = ${rsvp[0].ticket_type}
            `;

            return "success";
        });
        return result;
    } catch (error) {
        console.error("Error canceling RSVP:", error);
        return null;
    }
};

const getRsvpsByEventId = async (event_id) => {
    try {
        const rsvps = await sql`
        SELECT *
        FROM rsvps
        WHERE event_id = ${event_id}
    `;
        return rsvps;
    } catch (error) {
        console.error("Error fetching RSVPs:", error);
        return null;
    }
};

const getRsvpsByUserId = async (userId) => {
    try {
        const rsvps = await sql` SELECT r.id, r.event_id, r.user_id, r.ticket_type, r.status, r.created_at, e.title, e.date, e.location
        FROM rsvps r
        JOIN events e ON r.event_id = e.id
        JOIN users u ON r.user_id = u.id
        WHERE r.user_id = ${userId}
        AND r.status = 'confirmed'  ORDER BY r.created_at DESC
    `;
        return rsvps;
    } catch (error) {
        console.error("Error fetching RSVPs by user ID:", error);
        return null;
    }
};

export const queries = { getUserCredentials, createUser, getAllEvents, createEvent, updateEvent, deleteEvent, getEventById, addTickets, updateTickets, deleteTickets, getTickets, createEventRsvp, cancelRsvp, getRsvpsByEventId, getRsvpsByUserId };

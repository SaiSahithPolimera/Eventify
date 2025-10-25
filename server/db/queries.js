import dotenv from "dotenv";
import sql from "./conn.js";

dotenv.config();

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

const createEvent = async (title, description, date, location, organizerId, time) => {
    if (!title || !description || !date || !location || !organizerId || !time) {
        return null;
    }
    try {
        const res = await sql`
        INSERT INTO events (title, description, date, location, organizer_id, time)
        VALUES (${title}, ${description}, ${date}, ${location}, ${organizerId}, ${time})
        RETURNING id, title, description, date, location, organizer_id, time
    `;
        return res;
    } catch (error) {
        console.error("Error creating event:", error);
        return null;
    }
};

const getEventById = async (event_id) => {

    if (isNaN(event_id)) {
        return null;
    }

    try {
        const event = await sql`
        SELECT *
        FROM events
        WHERE id = ${event_id}
    `;
        return event[0];
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        return null;
    }
};

const updateEvent = async (id, title, description, date, location, time) => {
    try {
        const res = await sql`
        UPDATE events
        SET title = ${title}, description = ${description}, date = ${date}, location = ${location}, time = ${time}
        WHERE id = ${id}
        RETURNING id, title, description, date, location, time
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


const updateTickets = async (event_id, type, price, quantity, ticket_id) => {
    try {
        const res = await sql`
        UPDATE tickets
        SET price = ${price}, quantity = ${quantity}, type = ${type}
        WHERE id = ${ticket_id} AND event_id = ${event_id}
        RETURNING id, event_id, type, price, quantity`;
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


const createEventRsvp = async (event_id, user_id, ticket_id) => {
    return sql.begin(async (tx) => {
        const ticket = await tx`
      SELECT * FROM tickets
      WHERE id = ${ticket_id} AND event_id = ${event_id}
      FOR UPDATE
    `;

        if (ticket.length === 0)
            return { error: "Ticket not found" };

        if (ticket[0].quantity <= 0)
            return { error: "Ticket sold out" };

        const existing = await tx`
      SELECT * FROM rsvps
      WHERE event_id = ${event_id} AND user_id = ${user_id}
    `;
        if (existing.length > 0)
            return { error: "User already RSVPed" };

        const newRsvp = await tx`
      INSERT INTO rsvps (event_id, user_id, ticket_id, status)
      VALUES (${event_id}, ${user_id}, ${ticket_id}, 'confirmed')
      RETURNING *
    `;

        await tx`
      UPDATE tickets
      SET quantity = quantity - 1
      WHERE id = ${ticket_id} AND event_id = ${event_id}
    `;

        return newRsvp[0];
    });
};


const cancelRsvp = async (rsvpId, userId) => {
    try {
        const result = await sql.begin(async (sql) => {
            const rsvp = await sql`
        SELECT * FROM rsvps
        WHERE id = ${rsvpId} AND user_id = ${userId} AND status = 'confirmed'
        LIMIT 1
      `;

            if (rsvp.length === 0) return "not_found";

            await sql`
           DELETE FROM rsvps
              WHERE id = ${rsvpId} AND user_id = ${userId}
            `;

            await sql`
        UPDATE tickets 
        SET quantity = quantity + 1
        WHERE id = ${rsvp[0].ticket_id}
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
        const rsvps = await sql`
        SELECT *
        FROM rsvps
        WHERE user_id = ${userId}
    `;
        return rsvps;
    } catch (error) {
        console.error("Error fetching RSVPs by user ID:", error);
        return null;
    }
};

const getEventRsvps = async (eventId) => {
    try {
        const result = await sql`
            SELECT  
                r.id,
                r.event_id,
                r.user_id,
                r.ticket_id,
                r.status,
                u.name,
                u.email,
                t.type as ticket_type,
                t.price
            FROM rsvps r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN tickets t ON r.ticket_id = t.id
            WHERE r.event_id = ${eventId}
        `;
        return result;
    } catch (error) {
        console.error("Error fetching event RSVPs:", error);
        throw error;
    }
};

const getEventStats = async (eventId) => {
    try {
        const result = await sql`
    SELECT 
      e.id as event_id,
        e.title,
        COUNT(r.id) as total_rsvps,
        SUM(CASE WHEN t.type = 'paid' THEN 1 ELSE 0 END) as paid_rsvps,
        SUM(CASE WHEN t.type = 'free' THEN 1 ELSE 0 END) as free_rsvps,
        SUM(CASE WHEN t.type = 'paid' THEN t.price ELSE 0 END) as total_revenue
    FROM events e
    LEFT JOIN rsvps r ON e.id = r.event_id AND r.status = 'confirmed'
    LEFT JOIN tickets t ON r.ticket_id = t.id WHERE e.id = ${eventId}
    GROUP BY e.id
  `;
        return result[0];
    } catch (error) {
        console.error("Error fetching event stats:", error);
        throw error;
    }
};


const getUserDataById = async (userId) => {
    try {
        const result = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = ${userId}
    `;
        return result[0];
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
};
const getRsvpsForUpcomingEvents = async (startDate, endDate) => {
    try {
        const rsvps = await sql`
            SELECT 
                r.id,
                r.event_id,
                r.user_id,
                r.ticket_id,
                r.status,
                e.id as eid,
                e.title,
                e.date,
                e.location,
                u.id as uid,
                u.email,
                u.name
            FROM rsvps r
            INNER JOIN events e ON r.event_id = e.id
            INNER JOIN users u ON r.user_id = u.id
            WHERE r.status = 'confirmed'
            AND e.date >= ${startDate}
            AND e.date <= ${endDate}
            ORDER BY e.date ASC
        `;
        return rsvps;
    } catch (error) {
        console.error("Error fetching RSVPs for upcoming events:", error);
        return [];
    }
};

const getEventsByOrganizerId = async (organizerId) => {
    try {
        const events = await sql`
            SELECT *
            FROM events
            WHERE organizer_id = ${organizerId}
        `;
        return events;
    } catch (error) {
        console.error("Error fetching events by organizer ID:", error);
        return null;
    }
};

export const queries = { getUserCredentials, createUser, getAllEvents, createEvent, updateEvent, deleteEvent, getEventById, addTickets, updateTickets, deleteTickets, getTickets, createEventRsvp, cancelRsvp, getRsvpsByEventId, getRsvpsByUserId, getEventStats, getEventRsvps, getUserDataById, getRsvpsForUpcomingEvents, getEventsByOrganizerId };
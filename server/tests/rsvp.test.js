import request from "supertest";
import app from "../app.js";
import sql from "../db/conn.js";

describe("RSVP API Endpoints", () => {
    let organizerAgent;
    let attendeeAgent;
    let otherAttendeeAgent;
    let eventId;
    let ticketId;

    beforeEach(async () => {
        await sql`DELETE FROM rsvps`;
        await sql`DELETE FROM tickets`;
        await sql`DELETE FROM events`;
        await sql`DELETE FROM users`;

        organizerAgent = request.agent(app);
        attendeeAgent = request.agent(app);
        otherAttendeeAgent = request.agent(app);

        await organizerAgent.post("/api/auth/signup").send({ name: "Organizer", email: "organizer1@test.com", password: "password123", confirmPassword: "password123", role: "organizer" });
        await organizerAgent.post("/api/auth/login").send({ email: "organizer1@test.com", password: "password123" });

        await attendeeAgent.post("/api/auth/signup").send({ name: "Attendee", email: "attendee1@test.com", password: "password123", confirmPassword: "password123", role: "attendee" });
        await attendeeAgent.post("/api/auth/login").send({ email: "attendee1@test.com", password: "password123" });

        await otherAttendeeAgent.post("/api/auth/signup").send({ name: "Other Attendee", email: "other1@test.com", password: "password123", confirmPassword: "password123", role: "attendee" });
        await otherAttendeeAgent.post("/api/auth/login").send({ email: "other1@test.com", password: "password123" });

        const eventRes = await organizerAgent.post("/api/events").send({ title: "Test Event for RSVP", description: "The describe must be between 10 to 1000 characters", date: "2030-01-01", time: "10:00", location: "Test Location" });

        eventId = eventRes.body.event.id;

        const ticketRes = await organizerAgent.post(`/api/events/${eventId}/tickets`).send({ type: "free", price: 0, quantity: 10 });
        ticketId = ticketRes.body.ticketData[0].id;

    });

    afterAll(async () => {
        await sql.end();
    });

    describe("POST /api/rsvps", () => {
        it("should allow an attendee to RSVP for an event", async () => {
            const res = await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.rsvp).toHaveProperty("id");
        });

        it("should fail if an attendee tries to RSVP twice for the same event", async () => {
            await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            const res = await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("User already RSVPed");
        });

        it("should fail if tickets are sold out", async () => {
            const limitedEventRes = await organizerAgent.post("/api/events").send({ title: "Limited Ticket Event", description: "This must a long and valid description", date: "2030-02-01", time: "10:00", location: "calcutta" });
            const limitedEventId = limitedEventRes.body.event.id;
            const limitedTicketRes = await organizerAgent.post(`/api/events/${limitedEventId}/tickets`).send({ type: "free", price: 0, quantity: 1 });
            const limitedTicketId = limitedTicketRes.body.ticketData[0].id;

            await attendeeAgent.post("/api/rsvps").send({ event_id: limitedEventId, ticket_id: limitedTicketId });
            const res = await otherAttendeeAgent.post("/api/rsvps").send({ event_id: limitedEventId, ticket_id: limitedTicketId });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Ticket sold out");
        });
    });

    describe("GET /api/rsvps/my/", () => {
        it("should fetch all RSVPs for the currently logged-in user", async () => {
            await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            const res = await attendeeAgent.get("/api/rsvps/my/");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.rsvps).toHaveLength(1);
            expect(res.body.rsvps[0].event_id).toBe(eventId);
        });
    });

    describe("DELETE /api/rsvps/:id", () => {
        it("should allow a user to cancel their own RSVP", async () => {
            const rsvpRes = await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            const rsvpId = rsvpRes.body.rsvp.id;

            const res = await attendeeAgent.delete(`/api/rsvps/${rsvpId}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("RSVP cancelled successfully.");
        });

        it("should prevent a user from canceling another user's RSVP", async () => {
            const rsvpRes = await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            const rsvpId = rsvpRes.body.rsvp.id;

            const res = await otherAttendeeAgent.delete(`/api/rsvps/${rsvpId}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("RSVP not found.");
        });
    });

    describe("GET /api/rsvps/event/:id", () => {
        it("should allow an organizer to fetch all RSVPs for their event", async () => {
            await attendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });
            await otherAttendeeAgent.post("/api/rsvps").send({ event_id: eventId, ticket_id: ticketId });

            const res = await organizerAgent.get(`/api/rsvps/event/${eventId}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.rsvps).toHaveLength(2);
        });

        it("should deny access to attendees trying to fetch event RSVPs", async () => {
            const res = await attendeeAgent.get(`/api/rsvps/event/${eventId}`);
            expect(res.status).toBe(403);
        });
    });
});
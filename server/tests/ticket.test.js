import request from "supertest";
import app from "../app.js";
import sql from "../db/conn.js";

describe("Tickets API Endpoints", () => {
    let organizerAgent;
    let attendeeAgent;
    let organizerAgent2;
    let createdEventId;

    beforeEach(async () => {
        await sql`DELETE FROM rsvps`;
        await sql`DELETE FROM tickets`;
        await sql`DELETE FROM events`;
        await sql`DELETE FROM users`;

        organizerAgent = request.agent(app);
        attendeeAgent = request.agent(app);
        organizerAgent2 = request.agent(app);

        await organizerAgent.post("/api/auth/signup").send({
            name: "Test Organizer",
            email: "organizer3@test.com",
            password: "password123",
            confirmPassword: "password123",
            role: "organizer"
        });
        await organizerAgent.post("/api/auth/login").send({
            email: "organizer3@test.com",
            password: "password123"
        });

        await organizerAgent2.post("/api/auth/signup").send({
            name: "Second Organizer",
            email: "organizer2b@test.com",
            password: "password123",
            confirmPassword: "password123",
            role: "organizer"
        });
        await organizerAgent2.post("/api/auth/login").send({
            email: "organizer2b@test.com",
            password: "password123"
        });

        await attendeeAgent.post("/api/auth/signup").send({
            name: "Test Attendee",
            email: "attendee3@test.com",
            password: "password123",
            confirmPassword: "password123",
            role: "attendee"
        });
        await attendeeAgent.post("/api/auth/login").send({
            email: "attendee3@test.com",
            password: "password123"
        });

        const eventRes = await organizerAgent.post("/api/events").send({
            title: "Code and Coffee",
            description: "A fun coding event",
            date: "2025-12-07",
            time: "10:00",
            location: "Bangalore",
        });
        createdEventId = eventRes.body.event.id;
    });

    afterAll(async () => {
        await sql`DELETE FROM rsvps`;
        await sql`DELETE FROM tickets`;
        await sql`DELETE FROM events`;
        await sql`DELETE FROM users`;
        await sql.end();
    });

    describe("Ticket Creation", () => {
        it("should add 'free' and 'paid' tickets to an event by the organizer", async () => {
            const freeTicketRes = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "free", price: 0, quantity: 100 });
            expect(freeTicketRes.status).toBe(201);
            expect(freeTicketRes.body.success).toBe(true);
            expect(freeTicketRes.body.ticketData[0].type).toBe("free");

            const paidTicketRes = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "paid", price: 19.99, quantity: 50 });
            expect(paidTicketRes.status).toBe(201);
            expect(paidTicketRes.body.success).toBe(true);
            expect(paidTicketRes.body.ticketData[0].type).toBe("paid");
            expect(paidTicketRes.body.ticketData[0].price).toBe("19.99");
        });

        it("should fail when adding a ticket type that already exists for an event", async () => {
            await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "free", price: 0, quantity: 100 });

            const duplicateRes = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "free", price: 0, quantity: 50 });

            expect(duplicateRes.status).toBe(400);
            expect(duplicateRes.body.success).toBe(false);
        });

        it("should fail validation if a paid ticket has a price of 0 or less", async () => {
            const response = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "paid", price: 0, quantity: 50 });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors[0].message).toBe("Paid tickets must have price > 0");
        });

        it("should fail when an attendee tries to add tickets", async () => {
            const response = await attendeeAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "free", quantity: 100 });

            expect(response.status).toBe(403);
        });
    });

    describe("Ticket Update", () => {
        let ticketId;

        beforeEach(async () => {
            const res = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "paid", price: 25.00, quantity: 100 });
            ticketId = res.body.ticketData[0].id;
        });

        it("should successfully update a ticket by the event organizer", async () => {
            const response = await organizerAgent
                .put(`/api/events/${createdEventId}/tickets/${ticketId}`)
                .send({ type: "paid", price: 30.00, quantity: 75 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Tickets updated successfully");
        });

        it("should fail to update a ticket by an attendee", async () => {
            const response = await attendeeAgent
                .put(`/api/events/${createdEventId}/tickets/${ticketId}`)
                .send({ type: "paid", price: 30.00, quantity: 75 });

            expect(response.status).toBe(403);
        });

        it("should fail to update a ticket by another organizer", async () => {
            const response = await organizerAgent2
                .put(`/api/events/${createdEventId}/tickets/${ticketId}`)
                .send({ type: "paid", price: 30.00, quantity: 75 });

            expect(response.status).toBe(403);
        });
    });


    describe("Ticket Deletion", () => {
        let ticketId;

        beforeEach(async () => {
            const res = await organizerAgent
                .post(`/api/events/${createdEventId}/tickets`)
                .send({ type: "paid", price: 99.99, quantity: 20 });
            ticketId = res.body.ticketData[0].id;
        });

        it("should successfully delete a ticket type by the event organizer", async () => {
            const response = await organizerAgent
                .delete(`/api/events/${createdEventId}/tickets/${ticketId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Tickets deleted successfully");
        });

        it("should fail deletion when attempted by an attendee", async () => {
            const response = await attendeeAgent
                .delete(`/api/events/${createdEventId}/tickets/${ticketId}`);

            expect(response.status).toBe(403);
        });

        it("should fail deletion when attempted by another organizer", async () => {
            const response = await organizerAgent2
                .delete(`/api/events/${createdEventId}/tickets/${ticketId}`);

            expect(response.status).toBe(403);
        });
    });
});
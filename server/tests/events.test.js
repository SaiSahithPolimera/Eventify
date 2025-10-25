import request from "supertest";
import app from "../app.js";
import sql from "../db/conn.js";

describe("Events API", () => {
    let organizerAgent;
    let attendeeAgent;
    let createdEventId;
    let organizerAgent2;

    beforeEach(async () => {
        await sql`DELETE FROM rsvps`;
        await sql`DELETE FROM tickets`;
        await sql`DELETE FROM events`;
        await sql`DELETE FROM users`;

        organizerAgent = request.agent(app);
        attendeeAgent = request.agent(app);
        organizerAgent2 = request.agent(app);

        await organizerAgent
            .post("/api/auth/signup")
            .send({
                name: "Test Organizer",
                email: "organizer@test.com",
                password: "password123",
                confirmPassword: "password123",
                role: "organizer"
            });

        await organizerAgent
            .post("/api/auth/login")
            .send({
                email: "organizer@test.com",
                password: "password123"
            });

        await organizerAgent2
            .post("/api/auth/signup")
            .send({
                name: "Second Organizer",
                email: "organizer2@test.com",
                password: "password123",
                confirmPassword: "password123",
                role: "organizer"
            });

        await organizerAgent2
            .post("/api/auth/login")
            .send({
                email: "organizer2@test.com",
                password: "password123"
            });


        await attendeeAgent
            .post("/api/auth/signup")
            .send({
                name: "Test Attendee",
                email: "attendee@test.com",
                password: "password123",
                confirmPassword: "password123",
                role: "attendee"
            });

        await attendeeAgent
            .post("/api/auth/login")
            .send({
                email: "attendee@test.com",
                password: "password123"
            });
    });

    afterAll(async () => {
        await sql`DELETE FROM rsvps`;
        await sql`DELETE FROM tickets`;
        await sql`DELETE FROM events`;
        await sql`DELETE FROM users`;
        await sql.end();
    });

    describe("Event Creation", () => {
        it("should create a new event for an authenticated organizer", async () => {
            const response = await organizerAgent
                .post("/api/events")
                .send({
                    title: "Awesome Tech Conference",
                    description: "A conference for awesome tech people.",
                    date: "2028-10-20",
                    time: "09:00",
                    location: "Tech Hub Center"
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.event).toHaveProperty("id");
            createdEventId = response.body.event.id;
        });

        it("should fail to create an event for an authenticated attendee", async () => {
            const response = await attendeeAgent
                .post("/api/events")
                .send({
                    title: "Attendee Event Fail",
                    description: "This should not be created.",
                    date: "2028-11-15",
                    time: "10:00",
                    location: "Nowhere"
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Access denied. Insufficient permissions.");
        });

        it("should fail to create an event with invalid data (past date)", async () => {
            const response = await organizerAgent
                .post("/api/events")
                .send({
                    title: "Event in the Past",
                    description: "This event has already happened.",
                    date: "2020-01-01",
                    time: "12:00",
                    location: "The Past"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors[0].message).toBe("Date must be a valid future date");
        });

        it("should fail to create an event with invalid data (empty title)", async () => {
            const response = await organizerAgent
                .post("/api/events")
                .send({
                    title: "",
                    description: "An event without a name.",
                    date: "2028-12-01",
                    time: "14:00",
                    location: "Someplace"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors[0].message).toContain("cannot be empty");
        });
    });

    describe("Event Retrieval", () => {
        beforeEach(async () => {
            const res = await organizerAgent
                .post("/api/events")
                .send({
                    title: "Public Event",
                    description: "Everyone can see this.",
                    date: "2029-01-01",
                    time: "18:00",
                    location: "Public Square"
                });
            createdEventId = res.body.event.id;
        });

        it("should fetch all events", async () => {
            const response = await request(app).get("/api/events");
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBeGreaterThan(0);
        });

        it("should fetch a single event by its ID", async () => {
            const response = await request(app).get(`/api/events/${createdEventId}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event.id).toBe(createdEventId);
            expect(response.body.event.title).toBe("Public Event");
        });

        it("should fetch events created by a specific organizer", async () => {
            const response = await organizerAgent.get("/api/events/my-events");
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBe(1);
            expect(response.body.events[0].id).toBe(createdEventId);
        });

        it("should return 404 for a non-existent event", async () => {
            const response = await request(app).get("/api/events/999999");
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Event not found");
        });
    });

    describe("Event Modification", () => {
        beforeEach(async () => {
            const res = await organizerAgent
                .post("/api/events")
                .send({
                    title: "Modifiable Event",
                    description: "This event will be modified.",
                    date: "2030-05-05",
                    time: "15:00",
                    location: "The Lab"
                });
            createdEventId = res.body.event.id;
        });

        it("should successfully update an event by the original organizer", async () => {
            const response = await organizerAgent
                .put(`/api/events/${createdEventId}`)
                .send({
                    title: "Updated Event Title",
                    description: "The description has been updated.",
                    date: "2030-05-06",
                    time: "16:00",
                    location: "A New Location"
                });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event.title).toBe("Updated Event Title");
        });

        it("should fail to update an event by a other organizer", async () => {
            const response = await organizerAgent2
                .put(`/api/events/${createdEventId}`)
                .send({
                    title: "Unauthorized Update",
                    description: "This update should not be allowed.",
                    date: "2030-05-07",
                    time: "17:00",
                    location: "Another Location"
                });
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("You are not authorized to update this event");
        });

        it("should fail to update an event by an attendee", async () => {
            const response = await attendeeAgent
                .put(`/api/events/${createdEventId}`)
                .send({ title: "Attendee Update Fail" });
            expect(response.status).toBe(403);
        });

        it("should successfully delete an event by the original organizer", async () => {
            const response = await organizerAgent.delete(`/api/events/${createdEventId}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Event deleted successfully");

            const getResponse = await request(app).get(`/api/events/${createdEventId}`);
            expect(getResponse.status).toBe(404);
        });

        it("should fail to delete an event by an attendee", async () => {
            const response = await attendeeAgent.delete(`/api/events/${createdEventId}`);
            expect(response.status).toBe(403);
        });
    });
});
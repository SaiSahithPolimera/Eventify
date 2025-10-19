import { Router } from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, addTickets, updateTickets, deleteTickets, getTickets, getEventRsvps, getEventStats, getUserDataById, getOrganizerEvents } from "../controllers/eventController.js";
import { isOrganizer } from "../middleware/roleMiddleware.js";
import eventValidator from "../validators/eventValidator.js";
import ticketValidator from "../validators/ticketValidator.js";

const eventRouter = Router();

eventRouter.get("/api/events", getEvents);
eventRouter.get("/api/events/my-events", verifyToken, getOrganizerEvents);
eventRouter.get("/api/events/:id", getEvent);
eventRouter.post("/api/events", verifyToken, isOrganizer, eventValidator, createEvent);
eventRouter.put("/api/events/:id", verifyToken, isOrganizer, eventValidator, updateEvent);
eventRouter.delete("/api/events/:id", verifyToken, isOrganizer, deleteEvent);

eventRouter.get("/api/events/:id/tickets", getTickets);
eventRouter.post("/api/events/:id/tickets", verifyToken, ticketValidator, addTickets);
eventRouter.put("/api/events/:id/tickets/:ticket_id", verifyToken, ticketValidator, updateTickets);
eventRouter.delete("/api/events/:id/tickets/:ticket_id", verifyToken, isOrganizer, deleteTickets);


eventRouter.get("/api/events/:id/rsvps", verifyToken, isOrganizer, getEventRsvps);
eventRouter.get("/api/events/:id/stats", verifyToken, isOrganizer, getEventStats);

eventRouter.get("/api/users/:id/", verifyToken, isOrganizer, getUserDataById);

export default eventRouter;
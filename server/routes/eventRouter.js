import { Router } from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { isOrganizer } from "../middleware/roleMiddleware.js";
import eventValidator from "../validators/eventValidator.js";

const eventRouter = Router();

eventRouter.get("/api/events", getEvents);
eventRouter.get("/api/events/:id", getEvent);
eventRouter.post("/api/events", verifyToken, isOrganizer, eventValidator, createEvent);
eventRouter.put("/api/events/:id", verifyToken, isOrganizer, eventValidator, updateEvent);
eventRouter.delete("/api/events/:id", verifyToken, isOrganizer, deleteEvent);

export default eventRouter;
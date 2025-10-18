import { Router } from "express";
import { cancelRsvp, createRsvp, getMyRsvps, getEventRsvps } from "../controllers/rsvpController.js";
import { isOrganizer } from "../middleware/roleMiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const rsvpRouter = Router();

rsvpRouter.post("/api/rsvps", verifyToken, createRsvp);
rsvpRouter.delete("/api/rsvps/:id", verifyToken, cancelRsvp);
rsvpRouter.get("/api/rsvps/my/", verifyToken, getMyRsvps);
rsvpRouter.get("/api/rsvps/event/:id", verifyToken, isOrganizer, getEventRsvps);

export default rsvpRouter;
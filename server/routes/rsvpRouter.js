import { Router } from "express";
import { cancelRsvp, createRsvp, getMyRsvps, getEventRsvps } from "../controllers/rsvpController.js";
import { isOrganizer } from "../middleware/roleMiddleware.js";
import verifyToken from "../middleware/authMiddleware.js";

const rsvpRouter = Router();

rsvpRouter.get("/api/rsvps/event/:id", verifyToken, isOrganizer, getEventRsvps);
rsvpRouter.get("/api/rsvps/my/", verifyToken, getMyRsvps);
rsvpRouter.post("/api/rsvps", verifyToken, createRsvp);
rsvpRouter.delete("/api/rsvps/:id", verifyToken, cancelRsvp);

export default rsvpRouter;
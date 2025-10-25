import { queries } from "../db/queries.js";
import { sendEventConfirmation } from "../utils/emailService.js";

const createRsvp = async (req, res) => {
    const { event_id, ticket_id } = req.body;
    const user_id = req.user.id;

    if (!event_id || !ticket_id) {
        return res.status(400).json({
            success: false,
            message: "Event ID and ticket type are required."
        });
    }

    try {
        const rsvp = await queries.createEventRsvp(event_id, user_id, ticket_id);
        
        if (rsvp.error) {
            return res.status(400).json({
                success: false,
                message: rsvp.error
            });
        }

        const event = await queries.getEventById(event_id);
        const user = await queries.getUserDataById(user_id);

        if (process.env.NODE_ENV === 'production') {
            await sendEventConfirmation(user.email, {
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
            });
        }

        return res.status(201).json({
            success: true,
            message: "RSVP created successfully",
            rsvp
        });
    } catch (error) {
        console.error("Error creating RSVP:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const cancelRsvp = async (req, res) => {
    const { id } = req.params;

    const user_id = req.user.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "RSVP ID is required." });
    }

    try {
        const result = await queries.cancelRsvp(id, user_id);
        if (result === "not_found") {
            return res.status(404).json({ success: false, message: "RSVP not found." });
        }
        return res.status(200).json({ success: true, message: "RSVP cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling RSVP:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getMyRsvps = async (req, res) => {
    const user_id = req.user.id;
    try {
        const rsvps = await queries.getRsvpsByUserId(user_id);
        return res.status(200).json({ success: true, rsvps });
    } catch (error) {
        console.error("Error fetching RSVPs:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getEventRsvps = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Event ID is required." });
    }
    try {
        const event = await queries.getEventById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found." });
        }

        if (event.organizer_id !== user_id) {
            return res.status(403).json({ success: false, message: "Access denied. You are not the organizer of this event." });
        }

        const rsvps = await queries.getRsvpsByEventId(id);
        return res.status(200).json({ success: true, rsvps });
    } catch (error) {
        console.error("Error fetching event RSVPs:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export { createRsvp, cancelRsvp, getMyRsvps, getEventRsvps };
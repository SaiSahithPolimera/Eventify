import { validationResult } from "express-validator";
import { queries } from "../db/queries.js";

const getEvents = async (req, res) => {
    try {
        const events = await queries.getAllEvents();
        if (events.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No events found" 
            });
        }
        return res.status(200).json({ 
            success: true, 
            data: events 
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

const createEvent = async (req, res) => {
    const { title, description, date, location } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const filteredErrors = errors.array().map(
            (err) => ({ fieldName: err.path, message: err.msg })
        );
        return res.status(400).json({ 
            success: false, 
            errors: filteredErrors 
        });
    }

    try {
        const userId = req.user.id;
        const result = await queries.createEvent(title, description, date, location, userId);

        if (!result) {
            return res.status(400).json({ 
                success: false, 
                message: "Event creation failed" 
            });
        }
        return res.status(201).json({ 
            success: true, 
            message: "Event created successfully",
            data: result[0]
        });
    } catch (error) {
        console.error("Error creating event:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

const getEvent = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid event ID" 
        });
    }

    try {
        const event = await queries.getEventById(id);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found" 
            });
        }
        return res.status(200).json({ 
            success: true, 
            data: event 
        });
    } catch (error) {
        console.error("Error fetching event:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, location } = req.body;
    const errors = validationResult(req);

    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid event ID" 
        });
    }

    if (!errors.isEmpty()) {
        const filteredErrors = errors.array().map(
            (err) => ({ fieldName: err.path, message: err.msg })
        );
        return res.status(400).json({ 
            success: false, 
            errors: filteredErrors 
        });
    }

    try {
        const event = await queries.getEventById(id);
        const userId = req.user.id;

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found" 
            });
        }

        if (event.organizer_id !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You are not authorized to update this event" 
            });
        }

        const updatedEvent = await queries.updateEvent(id, title, description, date, location);
        if (!updatedEvent) {
            return res.status(400).json({ 
                success: false, 
                message: "Event update failed" 
            });
        }
        return res.status(200).json({ 
            success: true, 
            message: "Event updated successfully", 
            data: updatedEvent[0]
        });
    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid event ID" 
        });
    }

    try {
        const event = await queries.getEventById(id);

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: "Event not found" 
            });
        }

        if (event.organizer_id !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You are not authorized to delete this event" 
            });
        }

        const result = await queries.deleteEvent(id);
        if (result === "success") {
            return res.status(200).json({ 
                success: true, 
                message: "Event deleted successfully" 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting event" 
        });
    } catch (error) {
        console.error("Error deleting event:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export { getEvents, createEvent, updateEvent, deleteEvent, getEvent };
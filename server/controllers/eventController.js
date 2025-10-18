import { validationResult } from "express-validator";
import { queries } from "../db/queries.js";

const getEvents = async (req, res) => {
    try {
        const events = await queries.getAllEvents();
        if (events.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No events found"
            });
        }

        return res.status(200).json({
            success: true,
            events
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
    const { title, description, date, location, time } = req.body;
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
        const result = await queries.createEvent(title, description, date, location, userId, time);

        if (!result) {
            return res.status(400).json({
                success: false,
                message: "Event creation failed"
            });
        }
        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            event: result[0],
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
            event
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

        const updatedEvent = await queries.updateEvent(id, title, description, date, location, time);
        if (!updatedEvent) {
            return res.status(400).json({
                success: false,
                message: "Event update failed"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event: updatedEvent[0]
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

const addTickets = async (req, res) => {
    const { id: event_id } = req.params;
    const { type, price, quantity } = req.body;
    const event = await queries.getEventById(event_id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found"
        });
    }

    if (event.organizer_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to add tickets to this event"
        });
    }

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
        const ticketData = await queries.addTickets(event_id, type, price, quantity);
        if (!result) {
            return res.status(400).json({
                success: false,
                message: "Adding tickets failed"
            });
        }
        if (ticketData.message) {
            return res.status(400).json({
                success: false,
                message: ticketData.message
            });
        }
        return res.status(201).json({
            success: true,
            message: "Tickets added successfully",
            ticketData
        });
    } catch (error) {
        console.error("Error adding tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateTickets = async (req, res) => {
    const { type, price, quantity } = req.body;
    const { id: event_id, ticketId } = req.params;
    const event = await queries.getEventById(event_id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found"
        });
    }

    if (event.organizer_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to add tickets to this event"
        });
    }

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
        const result = await queries.updateTickets(event_id, type, price, quantity);
        if (!result) {
            return res.status(400).json({
                success: false,
                message: "Updating tickets failed"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Tickets updated successfully",
        });
    } catch (error) {
        console.error("Error updating tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const deleteTickets = async (req, res) => {
    const { type } = req.params;
    const { id: event_id, ticketId } = req.params;
    const event = await queries.getEventById(event_id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found"
        });
    }
    if (event.organizer_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to delete tickets from this event"
        });
    }

    try {
        const result = await queries.deleteTickets(event_id, ticketId);
        if (result === "success") {
            return res.status(200).json({
                success: true,
                message: "Tickets deleted successfully"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Error deleting tickets"
        });
    }
    catch (error) {
        console.error("Error deleting tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getTickets = async (req, res) => {
    const { id } = req.params;

    const event = await queries.getEventById(id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found"
        });
    }

    try {
        const tickets = await queries.getTickets(id);
        return res.status(200).json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { getEvents, createEvent, updateEvent, deleteEvent, getEvent, addTickets, updateTickets, deleteTickets, getTickets };
import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import EventForm from "../components/EventForm";

const EventCard = ({ event, onEdit, onDelete }) => {
  const ticket = event.tickets?.[0];
  const stats = event.stats;

  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-rose-300 transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-rose-600">
                {event.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                {event.description || "No description provided."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">Date:</span>
                  <span>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">Time:</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 md:col-span-2">
                  <span className="font-semibold">Location:</span>
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {ticket && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        Ticket Type:
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.type === "free"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {ticket.type === "free"
                          ? "Free"
                          : `$${parseFloat(ticket.price).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        Available:
                      </span>
                      <span className="text-slate-600">
                        {ticket.quantity} tickets
                      </span>
                    </div>
                  </>
                )}
                {stats && (
                  <>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
                      <span className="font-semibold text-blue-700">RSVPs:</span>
                      <span className="text-blue-700">{stats.total_rsvps || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded">
                      <span className="font-semibold text-green-700">Revenue:</span>
                      <span className="text-green-700">${stats.total_revenue || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="ml-4 flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(event)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors border border-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyEvents = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const today = new Date().toISOString().split("T")[0];

  const initialFormState = {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    locationType: "physical",
    ticketType: "free",
    ticketPrice: "",
    ticketQuantity: "",
  };

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState(initialFormState);
  const [modal, setModal] = useState({ type: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}/events/my-events/`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.events)) {
        throw new Error(data.message || "Could not fetch events.");
      }

      const eventsWithDetails = await Promise.all(
        data.events.map(async (event) => {
          try {
            const [ticketRes, statsRes] = await Promise.all([
              fetch(`${BASE_URL}/events/${event.id}/tickets`, { credentials: "include" }),
              fetch(`${BASE_URL}/events/${event.id}/stats`, { credentials: "include" }),
            ]);
            const ticketsData = ticketRes.ok ? await ticketRes.json() : { tickets: [] };
            const statsData = statsRes.ok ? await statsRes.json() : { stats: {} };
            return {
              ...event,
              tickets: ticketsData.tickets || [],
              stats: statsData.stats || { total_rsvps: 0, total_revenue: 0 },
            };
          } catch (err) {
            return { ...event, tickets: [], stats: { total_rsvps: 0, total_revenue: 0 } };
          }
        })
      );
      setEvents(eventsWithDetails);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const openModal = (type, data = null) => {
    setFormErrors({});
    if (type === "create") {
      setFormState(initialFormState);
    } else if (type === "edit" && data) {
      const ticket = data.tickets?.[0];
      setFormState({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        ticketType: ticket?.type || "free",
        ticketPrice: ticket?.price || "",
        ticketQuantity: ticket?.quantity || "",
      });
    }
    setModal({ type, data });
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    setFormErrors({});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    try {
      if (modal.type === "create") {
        await createEvent();
      } else if (modal.type === "edit") {
        await updateEvent();
      }
      closeModal();
      fetchMyEvents();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const newErrors = {};
        err.errors.forEach(e => {
          if (e.fieldName) {
            newErrors[e.fieldName] = e.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        setFormErrors({ submit: err.message || "An unexpected error occurred." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const createEvent = async () => {
    const { ticketType, ticketPrice, ticketQuantity, ...eventData } = formState;
    const eventRes = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(eventData),
    });
    const eventResult = await eventRes.json();
    if (!eventRes.ok) throw eventResult;

    const ticketData = {
      type: ticketType,
      price: ticketType === "paid" ? parseFloat(ticketPrice) : 0,
      quantity: parseInt(ticketQuantity),
    };
    const ticketRes = await fetch(`${BASE_URL}/events/${eventResult.event.id}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ticketData),
    });
    const ticketResult = await ticketRes.json();
    if (!ticketRes.ok) throw ticketResult;
  };

  const updateEvent = async () => {
    const { id, tickets, stats } = modal.data;
    const rsvpCount = stats?.total_rsvps || 0;
    if (parseInt(formState.ticketQuantity) < rsvpCount) {
      throw new Error(`Ticket quantity cannot be less than the ${rsvpCount} registered attendees.`);
    }

    const { ticketType, ticketPrice, ticketQuantity, ...eventData } = formState;
    const eventRes = await fetch(`${BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(eventData),
    });
    if (!eventRes.ok) {
      const errorData = await eventRes.json();
      throw errorData;
    }

    const ticket = tickets?.[0];
    const ticketData = {
      type: ticketType,
      price: ticketType === "paid" ? parseFloat(ticketPrice) : 0,
      quantity: parseInt(ticketQuantity),
    };
    const ticketMethod = ticket ? "PUT" : "POST";
    const ticketUrl = ticket
      ? `${BASE_URL}/events/${id}/tickets/${ticket.id}`
      : `${BASE_URL}/events/${id}/tickets`;
    const ticketRes = await fetch(ticketUrl, {
      method: ticketMethod,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ticketData),
    });
    if (!ticketRes.ok) {
      const errorData = await ticketRes.json();
      throw errorData;
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/events/${modal.data}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete event.");
      }
      closeModal();
      fetchMyEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-slate-600">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-slate-900 mb-2 font-sans">My Events</h1>
            <p className="text-slate-600">Manage all your created events</p>
          </div>
          <button
            onClick={() => openModal("create")}
            className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Create Event
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchMyEvents} className="ml-4 underline font-semibold hover:no-underline">
              Retry
            </button>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm transition-colors"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-4xl mb-4 font-bold text-slate-700">No Events</p>
            <p className="text-slate-600 text-lg font-medium mb-2">
              {searchTerm ? "No events match your search" : "You haven't created any events yet"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal("create")}
                className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Create Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openModal("edit", event)}
                onDelete={() => openModal("delete", event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {(modal.type === "create" || modal.type === "edit") && (
        <Modal
          show={true}
          onClose={closeModal}
          title={modal.type === "create" ? "Create Event" : "Edit Event"}
        >
          <form onSubmit={handleFormSubmit}>
            <EventForm form={formState} setForm={setFormState} today={today} errors={formErrors} />
            {modal.type === "edit" && modal.data?.stats && (
              <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Event Stats</h4>
                <p className="text-sm text-slate-600">
                  {modal.data.stats.total_rsvps || 0} registered attendees.
                </p>
              </div>
            )}
            {formErrors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formErrors.submit}
              </div>
            )}
            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
              <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 cursor-pointer rounded-lg font-semibold hover:bg-slate-200">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700  cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "delete" && (
        <Modal show={true} onClose={closeModal} maxWidth="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Delete Event?</h2>
          <p className="text-slate-600 mb-6">
            Are you sure? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {isSubmitting ? "Deleting..." : "Delete Event"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyEvents;
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CreateEventModal from "../components/CreateEventModal";

const MyEvents = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    locationType: "physical",
    ticketType: "free",
    ticketPrice: "",
    ticketQuantity: "",
  });
  const [eventStats, setEventStats] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE_URL}/events`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await res.json();
      const eventsList = Array.isArray(data.events) ? data.events : [];

      const eventsWithDetails = await Promise.all(
        eventsList.map(async (event) => {
          try {
            const ticketRes = await fetch(`${BASE_URL}/events/${event.id}/tickets`, {
              credentials: "include",
            });

            const ticketsData = ticketRes.ok ? await ticketRes.json() : { tickets: [] };
            const tickets = ticketsData.tickets || [];

            return {
              ...event,
              tickets,
            };
          } catch (err) {
            console.error(`Error fetching details for event ${event.id}:`, err);
            return { ...event, tickets: [] };
          }
        })
      );

      setEvents(eventsWithDetails);
      setFilteredEvents(eventsWithDetails);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async (eventId) => {
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}/stats`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setEventStats((prev) => ({
          ...prev,
          [eventId]: data.stats,
        }));
      }
    } catch (err) {
      console.error("Error fetching event stats:", err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);

      const eventData = {
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        location: form.location,
        locationType: form.locationType,
      };

      const eventRes = await fetch(`${BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      const eventResult = await eventRes.json();

      if (!eventRes.ok) {
        if (eventResult.errors) {
          const errorMessages = eventResult.errors
            .map((err) => err.message)
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(eventResult.message || "Failed to create event");
      }

      const ticketData = {
        type: form.ticketType,
        price: form.ticketType === "paid" ? parseFloat(form.ticketPrice) : 0,
        quantity: parseInt(form.ticketQuantity),
      };

      const ticketRes = await fetch(
        `${BASE_URL}/events/${eventResult.event.id}/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(ticketData),
        }
      );

      const ticketResult = await ticketRes.json();

      if (!ticketRes.ok) {
        throw new Error(
          ticketResult.message || "Event created but failed to add tickets"
        );
      }

      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        locationType: "physical",
        ticketType: "free",
        ticketPrice: "",
        ticketQuantity: "",
      });
      setShowCreateForm(false);
      fetchMyEvents();
      alert("Event and tickets created successfully!");
    } catch (err) {
      console.error("Create event error:", err);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
    });
    setShowEditModal(true);
    fetchEventStats(event.id);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title || !editForm.date || !editForm.time || !editForm.location) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setUpdating(true);

      const res = await fetch(`${BASE_URL}/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update event");
      }

      alert("Event updated successfully!");
      setShowEditModal(false);
      fetchMyEvents();
    } catch (err) {
      console.error("Error updating event:", err);
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      alert("Event deleted successfully!");
      setShowDeleteConfirm(null);
      fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(err.message);
    }
  };

  const today = new Date().toISOString().split("T")[0];

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
            onClick={() => setShowCreateForm(true)}
            className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Create Event
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={fetchMyEvents}
              className="ml-4 underline font-semibold hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <CreateEventModal
          showCreateForm={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          form={form}
          setForm={setForm}
          creating={creating}
          onSubmit={handleCreateEvent}
        />

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-4xl mb-4 font-bold text-slate-700">No Events</p>
            <p className="text-slate-600 text-lg font-medium mb-2">
              {searchTerm
                ? "No events match your search"
                : "You haven't created any events yet"}
            </p>
            <p className="text-slate-500 text-sm">
              {!searchTerm && "Click 'Create Event' to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Create Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const ticket =
                event.tickets && event.tickets.length > 0 ? event.tickets[0] : null;
              const stats = eventStats[event.id];

              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-rose-600">E</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {event.description || "No description"}
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
                                  <span className="font-semibold text-blue-700">
                                    RSVPs:
                                  </span>
                                  <span className="text-blue-700">
                                    {stats.total_rsvps || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded">
                                  <span className="font-semibold text-green-700">
                                    Revenue:
                                  </span>
                                  <span className="text-green-700">
                                    ${stats.total_revenue || 0}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(event.id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-slate-900 mb-6">Edit Event</h2>

            <div className="space-y-5">
              <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  placeholder="Event title"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows="3"
                  className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none transition-all"
                  placeholder="Event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-slate-700 font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    min={today}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-slate-700 font-medium mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time: e.target.value })
                    }
                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  placeholder="Event location"
                />
              </div>

              {eventStats[selectedEvent.id] && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Event Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-slate-600">Total RSVPs</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {eventStats[selectedEvent.id].total_rsvps}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${eventStats[selectedEvent.id].total_revenue}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Paid Tickets</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {eventStats[selectedEvent.id].paid_tickets}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Free Tickets</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {eventStats[selectedEvent.id].free_tickets}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updating}
                className={`flex-1 bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors cursor-pointer ${
                  updating ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Delete Event?
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone. All associated RSVPs and tickets will also be deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
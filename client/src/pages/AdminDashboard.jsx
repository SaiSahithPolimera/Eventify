import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const AdminDashboard = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTicketType, setFilterTicketType] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    fetchEventDetails();
  }, [selectedEventId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchTerm, attendees, filterStatus, filterTicketType, sortBy]);


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
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const eventRes = await fetch(`${BASE_URL}/events/${selectedEventId}`, {
        credentials: "include",
      });

      if (!eventRes.ok) {
        throw new Error("Failed to fetch event details");
      }

      const eventData = await eventRes.json();
      const event = eventData.event || eventData;
      setSelectedEvent(event);

      const statsRes = await fetch(`${BASE_URL}/events/${selectedEventId}/stats`, {
        credentials: "include",
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const attendeesRes = await fetch(`${BASE_URL}/events/${selectedEventId}/rsvps`, {
        credentials: "include",
      });

      if (!attendeesRes.ok) {
        throw new Error("Failed to fetch attendees");
      }

      const attendeesData = await attendeesRes.json();
      const rsvps = Array.isArray(attendeesData.rsvps) ? attendeesData.rsvps : [];

      const enrichedAttendees = await Promise.all(
        rsvps.map((rsvp) => fetchUserData(rsvp))
      );

      const validAttendees = enrichedAttendees.filter(
        (attendee) => attendee && attendee.name && attendee.email
      );


      setAttendees(validAttendees);
      setFilteredAttendees(validAttendees);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.message);
      setAttendees([]);
      setFilteredAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (rsvp) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${rsvp.user_id}/`, {
        credentials: "include",
      });

      if (!res.ok) {
        console.warn(`Failed to fetch user ${rsvp.user_id}`);
        return null;
      }


      const { userData } = await res.json();

      return {
        rsvp_id: rsvp.id,
        user_id: rsvp.user_id,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        ticket_price: rsvp.ticket_price,
        status: rsvp.status,
        key_id: rsvp.id || userData.id,
      };
    } catch (err) {
      console.error(`Error fetching user ${rsvp.user_id}:`, err);
      return null;
    }
  };


  const applyFiltersAndSort = () => {
    let filtered = attendees.filter((attendee) => {
      const matchesSearch =
        attendee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || attendee.status === filterStatus;

      const matchesTicketType =
        filterTicketType === "all" || attendee.ticket_type === filterTicketType;

      return matchesSearch && matchesStatus && matchesTicketType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "date":
          return new Date(b.created_at) - new Date(a.created_at);
        case "ticket":
          return (a.ticket_type || "").localeCompare(b.ticket_type || "");
        default:
          return 0;
      }
    });

    setFilteredAttendees(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterTicketType("all");
    setSortBy("name");
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    resetFilters();
  };


  const renderStatCard = (label, value, bgColor, textColor) => (
    <div
      className={`bg-gradient-to-br ${bgColor} rounded-lg p-4 border border-opacity-30 ${textColor.replace(
        "text-",
        "border-"
      )}`}
    >
      <p className={`text-sm ${textColor} font-semibold uppercase`}>{label}</p>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );

  const renderEventSummary = () => (
    <div className="mb-8 bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {selectedEvent?.title}
      </h2>
      <p className="text-slate-600 mb-6">{selectedEvent?.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {renderStatCard(
          "Total Attendees",
          stats?.total_rsvps || 0,
          "from-blue-50 to-blue-100",
          "text-black"
        )}
        {renderStatCard(
          "Total Revenue",
          `$${parseFloat(stats?.total_revenue || 0).toFixed(2)}`,
          "white",
          "text-black"
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-4">
        <div>
          <p className="text-slate-600 font-semibold">Date</p>
          <p className="text-slate-900">
            {new Date(selectedEvent?.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold"> Time</p>
          <p className="text-slate-900">{selectedEvent?.time || "TBA"}</p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold"> Location</p>
          <p className="text-slate-900">{selectedEvent?.location || "TBA"}</p>
        </div>
      </div>
    </div>
  );


  const renderFilterSection = () => (
    <div className="p-6 border-b border-slate-200 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          >
            <option value="name">Name (A-Z)</option>
            <option value="email">Email (A-Z)</option>
            <option value="date">Date (Newest First)</option>
          </select>
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="text-sm font-semibold text-slate-600 hover:text-slate-900 underline"
      >
        Clear All Filters
      </button>
    </div>
  );

  const renderAttendeeTable = () => (
    <>
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 mt-3">Loading attendees...</p>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p className="text-lg font-medium">📋 No attendees found</p>
          <p className="text-sm mt-1">
            {searchTerm || filterStatus !== "all" || filterTicketType !== "all"
              ? "Try adjusting your filters"
              : "No one has registered yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee, idx) => (
                <tr
                  key={attendee.key_id}
                  className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {attendee.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <a
                      href={`mailto:${attendee.email}`}
                      className="text-rose-600 hover:text-rose-700 underline"
                      title={`Send email to ${attendee.email}`}
                    >
                      {attendee.email}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${attendee.role === "organizer"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {attendee.role === "organizer"
                        ? "Organizer"
                        : "Attendee"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${attendee.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {attendee.status === "confirmed"
                        ? "Confirmed"
                        : "Cancelled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAttendees.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-600 flex justify-between items-center">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredAttendees.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{attendees.length}</span>{" "}
            attendees
            {(searchTerm || filterStatus !== "all" || filterTicketType !== "all") && (
              <span className="text-slate-500 ml-2">(filtered)</span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </>
  );


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-slate-900 mb-2 font-sans">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Track RSVPs, manage attendees.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchMyEvents}
              className="text-sm font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-slate-700 font-semibold mb-2">
            Select Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium"
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {selectedEventId && selectedEvent && stats ? (
          <>
            {renderEventSummary()}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {renderFilterSection()}
              {renderAttendeeTable()}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
            <p className="text-2xl font-bold text-slate-700 mb-2">Select an Event</p>
            <p className="text-slate-600 text-lg">
              Choose an event from the dropdown above to view all attendees and
              analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
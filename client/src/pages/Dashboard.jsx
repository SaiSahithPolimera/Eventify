import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Filterbar from "../components/Filterbar";
import BrowseEventsTab from "../components/BrowseEventsTab";
import EventDetailModal from "../components/EventDetailModal";
import MyRsvpsTab from "../components/MyRsvpTab";
import ResponseModal from "../components/ResponseModal";


const Dashboard = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userRsvps, setUserRsvps] = useState(new Set());
  const [rsvpdEvents, setRsvpdEvents] = useState([]);
  const [loadingRsvpdEvents, setLoadingRsvpdEvents] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [responseModal, setResponseModal] = useState(null);

  const [filters, setFilters] = useState({
    location: "",
    date: "",
    price: "all",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingRsvp, setCancelingRsvp] = useState(null);

  const showResponse = (title, message, type = "success") => {
    setResponseModal({ title, message, type });
  };

  const closeResponse = () => {
    setResponseModal(null);
  };

  const fetchUserRsvps = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/rsvps/my/`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const rsvpEventIds = new Set(
          data.rsvps
            .map((rsvp) => (rsvp.status === "confirmed" ? rsvp.event_id : null))
            .filter((id) => id !== null)
        );
        setUserRsvps(rsvpEventIds);
      }
    } catch (err) {
      console.error("Failed to fetch user RSVPs:", err);
    }
  }, [BASE_URL]);

  const fetchRsvpdEvents = useCallback(async () => {
    try {
      setLoadingRsvpdEvents(true);

      const res = await fetch(`${BASE_URL}/rsvps/my/`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch RSVP'd events");
      }

      const data = await res.json();
      const rsvps = (data.rsvps || []).filter((rsvp) => rsvp.status === "confirmed");

      const eventsWithDetailsPromises = rsvps.map(async (rsvp) => {
        try {
          const eventRes = await fetch(`${BASE_URL}/events/${rsvp.event_id}`, {
            credentials: "include",
          });

          if (!eventRes.ok) {
            console.error(`Failed to load event ${rsvp.event_id}`);
            return null;
          }

          const eventData = await eventRes.json();
          const event = eventData.event || eventData;

          const ticketRes = await fetch(
            `${BASE_URL}/events/${rsvp.event_id}/tickets`,
            {
              credentials: "include",
            }
          );

          const tickets = ticketRes.ok ? (await ticketRes.json()).tickets || [] : [];

          return {
            ...event,
            tickets,
            rsvp_id: rsvp.id,
            ticket_id: rsvp.ticket_id,
          };
        } catch (err) {
          console.error(`Error fetching event details for ${rsvp.event_id}:`, err);
          return null;
        }
      });

      const eventsData = await Promise.all(eventsWithDetailsPromises);
      const validEvents = eventsData.filter((event) => event !== null);

      setRsvpdEvents(validEvents);
    } catch (err) {
      console.error("Failed to fetch RSVP'd events:", err);
    } finally {
      setLoadingRsvpdEvents(false);
    }
  }, [BASE_URL]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const eventsRes = await fetch(`${BASE_URL}/events`, {
        credentials: "include",
      });

      if (!eventsRes.ok) {
        const errorData = await eventsRes.json();
        throw new Error(errorData.message || "Failed to load events list");
      }

      const data = await eventsRes.json();
      const eventsList = Array.isArray(data.events) ? data.events : [];

      const eventsWithTicketsPromises = eventsList.map(async (event) => {
        try {
          const ticketRes = await fetch(
            `${BASE_URL}/events/${event.id}/tickets`,
            {
              credentials: "include",
            }
          );

          if (!ticketRes.ok) {
            console.error(`Failed to load tickets for event ${event.id}`);
            return { ...event, tickets: [] };
          }

          const { tickets } = await ticketRes.json();

          return {
            ...event,
            tickets: tickets || [],
          };
        } catch (err) {
          console.error(`Error fetching tickets for event ${event.id}:`, err);
          return { ...event, tickets: [] };
        }
      });

      const finalEventsData = await Promise.all(eventsWithTicketsPromises);

      setEvents(finalEventsData || []);
      setFiltered(finalEventsData || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
      setEvents([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    let f = [...events];

    if (filters.location) {
      f = f.filter((e) =>
        e.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.date) {
      f = f.filter(
        (e) =>
          new Date(e.date).toDateString() ===
          new Date(filters.date).toDateString()
      );
    }

    if (filters.price !== "all") {
      if (filters.price === "free") {
        f = f.filter((e) => {
          const ticket = e.tickets && e.tickets.length > 0 ? e.tickets[0] : null;
          return ticket && parseFloat(ticket.price) === 0;
        });
      } else if (filters.price === "paid") {
        f = f.filter((e) => {
          const ticket = e.tickets && e.tickets.length > 0 ? e.tickets[0] : null;
          return ticket && parseFloat(ticket.price) > 0;
        });
      }
    }

    setFiltered(f);
  }, [filters, events]);

  const handleRSVP = async () => {
    try {
      if (!selectedEvent) return;

      if (!selectedEvent.tickets || selectedEvent.tickets.length === 0) {
        showResponse("Unable to RSVP", "This event does not have tickets available for RSVP", "error");
        return;
      }

      const ticket = selectedEvent.tickets[0];

      if (userRsvps.has(selectedEvent.id)) {
        showResponse("Already Registered", "You have already RSVP'd to this event!", "info");
        return;
      }

      if (!ticket.quantity || parseInt(ticket.quantity) <= 0) {
        showResponse("Sold Out", "Sorry, tickets are sold out!", "error");
        return;
      }

      const rsvpData = {
        event_id: selectedEvent.id,
        ticket_id: ticket.id,
      };

      const res = await fetch(`${BASE_URL}/rsvps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(rsvpData),
      });

      const data = await res.json();

      if (!res.ok) {
        showResponse("RSVP Failed", data.message || "Failed to RSVP", "error");
        return;
      }

      showResponse("Success!", data.message || "RSVP confirmed! Check your email for details.", "success");
      setSelectedEvent(null);
      fetchEvents();
      fetchUserRsvps();
      fetchRsvpdEvents();
    } catch (err) {
      console.error("RSVP error:", err);
      showResponse("Error", err.message || "Something went wrong", "error");
    }
  };

  const handleCancelRsvp = async (rsvpId) => {

    try {
      setCancelingRsvp(rsvpId);

      const res = await fetch(`${BASE_URL}/rsvps/${rsvpId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        showResponse("Cancellation Failed", errorData.message || "Failed to cancel RSVP", "error");
        return;
      }

      const successData = await res.json();
      showResponse("Cancelled", successData.message || "RSVP cancelled successfully", "success");
      fetchRsvpdEvents();
      fetchEvents();
      fetchUserRsvps();
    } catch (err) {
      console.error("Cancel RSVP error:", err);
      showResponse("Error", err.message || "Something went wrong", "error");
    } finally {
      setCancelingRsvp(null);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUserRsvps();
  }, [fetchEvents, fetchUserRsvps]);

  if (loading && activeTab === "browse")
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-600">Loading events...</p>
        </div>
      </div>
    );

  if (error && activeTab === "browse")
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-slate-50 p-8 rounded-lg shadow-sm border border-slate-200">
          <p className="text-4xl mb-4 font-bold text-slate-700">⚠️</p>
          <p className="text-lg font-medium text-slate-700 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-4 px-2 font-sans text-lg cursor-pointer transition-all ${activeTab === "browse"
                ? "text-rose-600 border-b-2 border-rose-600"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Browse Events
          </button>
          <button
            onClick={() => {
              setActiveTab("my-rsvps");
              fetchRsvpdEvents();
            }}
            className={`pb-4 px-2 font-sans cursor-pointer text-lg transition-all ${activeTab === "my-rsvps"
                ? "text-rose-600 border-b-2 border-rose-600"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            My RSVP'd Events ({userRsvps.size})
          </button>
        </div>

        {activeTab === "browse" && (
          <div className="space-y-8">
            <Filterbar
              filters={filters}
              setFilters={setFilters}
              filtered={filtered}
            />
            <BrowseEventsTab
              filtered={filtered}
              userRsvps={userRsvps}
              setSelectedEvent={setSelectedEvent}
            />
          </div>
        )}

        {activeTab === "my-rsvps" && (
          <MyRsvpsTab
            rsvpdEvents={rsvpdEvents}
            loadingRsvpdEvents={loadingRsvpdEvents}
            onCancelRsvp={handleCancelRsvp}
            cancelingRsvp={cancelingRsvp}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      <EventDetailModal
        selectedEvent={selectedEvent}
        userRsvps={userRsvps}
        onClose={() => setSelectedEvent(null)}
        onRsvp={handleRSVP}
      />

      {responseModal && (
        <ResponseModal
          title={responseModal.title}
          message={responseModal.message}
          type={responseModal.type}
          onClose={closeResponse}
        />
      )}
    </div>
  );
};

export default Dashboard;
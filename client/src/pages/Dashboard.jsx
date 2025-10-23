import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Filterbar from "../components/Filterbar";
import BrowseEventsTab from "../components/BrowseEventsTab";
import MyRsvpsTab from "../components/MyRsvpTab";
import Modal from "../components/Modal";

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
  const [isRsvping, setIsRsvping] = useState(false);

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
            .filter(Boolean)
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
      const res = await fetch(`${BASE_URL}/rsvps/my/`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch RSVP'd events");

      const data = await res.json();
      const rsvps = (data.rsvps || []).filter((rsvp) => rsvp.status === "confirmed");

      const eventsData = await Promise.all(
        rsvps.map(async (rsvp) => {
          try {
            const eventRes = await fetch(`${BASE_URL}/events/${rsvp.event_id}`, { credentials: "include" });
            if (!eventRes.ok) return null;
            const eventData = await eventRes.json();
            const event = eventData.event || eventData;

            const ticketRes = await fetch(`${BASE_URL}/events/${rsvp.event_id}/tickets`, { credentials: "include" });
            const tickets = ticketRes.ok ? (await ticketRes.json()).tickets || [] : [];

            return { ...event, tickets, rsvp_id: rsvp.id, ticket_id: rsvp.ticket_id };
          } catch (err) {
            return null;
          }
        })
      );
      setRsvpdEvents(eventsData.filter(Boolean));
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
      const eventsRes = await fetch(`${BASE_URL}/events`, { credentials: "include" });
      if (!eventsRes.ok) throw new Error((await eventsRes.json()).message || "Failed to load events");

      const data = await eventsRes.json();
      const eventsList = Array.isArray(data.events) ? data.events : [];

      const finalEventsData = await Promise.all(
        eventsList.map(async (event) => {
          try {
            const ticketRes = await fetch(`${BASE_URL}/events/${event.id}/tickets`, { credentials: "include" });
            const tickets = ticketRes.ok ? (await ticketRes.json()).tickets || [] : [];
            return { ...event, tickets };
          } catch (err) {
            return { ...event, tickets: [] };
          }
        })
      );
      setEvents(finalEventsData);
      setFiltered(finalEventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    let f = [...events];
    if (filters.location) {
      f = f.filter((e) => e.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.date) {
      f = f.filter((e) => new Date(e.date).toDateString() === new Date(filters.date).toDateString());
    }
    if (filters.price !== "all") {
      f = f.filter((e) => {
        const ticket = e.tickets?.[0];
        if (!ticket) return false;
        return filters.price === "free" ? parseFloat(ticket.price) === 0 : parseFloat(ticket.price) > 0;
      });
    }
    setFiltered(f);
  }, [filters, events]);

  const handleRSVP = async () => {
    if (!selectedEvent) return;
    const ticket = selectedEvent.tickets?.[0];

    if (!ticket) return showResponse("Unable to RSVP", "No tickets available.", "error");
    if (userRsvps.has(selectedEvent.id)) return showResponse("Already Registered", "You have already RSVP'd.", "info");
    if (!ticket.quantity || parseInt(ticket.quantity) <= 0) return showResponse("Sold Out", "Tickets are sold out.", "error");

    setIsRsvping(true);
    try {
      const res = await fetch(`${BASE_URL}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ event_id: selectedEvent.id, ticket_id: ticket.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to RSVP");

      showResponse("Success!", data.message || "RSVP confirmed!", "success");
      setSelectedEvent(null);
      fetchEvents();
      fetchUserRsvps();
      fetchRsvpdEvents();
    } catch (err) {
      showResponse("Error", err.message, "error");
    } finally {
      setIsRsvping(false);
    }
  };

  const handleCancelRsvp = async (rsvpId) => {
    setCancelingRsvp(rsvpId);
    try {
      const res = await fetch(`${BASE_URL}/rsvps/${rsvpId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel RSVP");

      showResponse("Cancelled", data.message || "RSVP cancelled successfully.", "success");
      fetchRsvpdEvents();
      fetchEvents();
      fetchUserRsvps();
    } catch (err) {
      showResponse("Error", err.message, "error");
    } finally {
      setCancelingRsvp(null);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUserRsvps();
  }, [fetchEvents, fetchUserRsvps]);

  const renderLoading = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-slate-600">Loading events...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center bg-slate-50 p-8 rounded-lg shadow-sm border border-slate-200">
        <p className="text-4xl mb-4 font-bold text-slate-700">⚠️</p>
        <p className="text-lg font-medium text-slate-700 mb-4">{error}</p>
        <button onClick={fetchEvents} className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
          Retry
        </button>
      </div>
    </div>
  );

  if (loading && activeTab === "browse") return renderLoading();
  if (error && activeTab === "browse") return renderError();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-4 px-2 font-sans text-lg cursor-pointer transition-all ${activeTab === "browse" ? "text-rose-600 border-b-2 border-rose-600" : "text-slate-600 hover:text-slate-900"}`}
          >
            Browse Events
          </button>
          <button
            onClick={() => {
              setActiveTab("my-rsvps");
              fetchRsvpdEvents();
            }}
            className={`pb-4 px-2 font-sans text-lg cursor-pointer transition-all ${activeTab === "my-rsvps" ? "text-rose-600 border-b-2 border-rose-600" : "text-slate-600 hover:text-slate-900"}`}
          >
            My RSVP'd Events ({userRsvps.size})
          </button>
        </div>

        {activeTab === "browse" && (
          <div className="space-y-8">
            <Filterbar filters={filters} setFilters={setFilters} filtered={filtered} />
            <BrowseEventsTab filtered={filtered} userRsvps={userRsvps} setSelectedEvent={setSelectedEvent} />
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

      {selectedEvent && (
        <Modal show={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent.title}>
          <div className="space-y-4">
            <p className="text-slate-600">{selectedEvent.description || "No description available."}</p>
            <div className="text-sm space-y-2 border-t border-b border-slate-200 py-4">
              <p><span className="font-semibold">Date:</span> {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {selectedEvent.time}</p>
              <p><span className="font-semibold">Location:</span> {selectedEvent.location}</p>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
              <p className="font-semibold text-slate-800">Ticket</p>
              <p className="text-green-600 font-bold">
                {selectedEvent.tickets?.[0]?.type === 'free' ? 'Free' : `$${parseFloat(selectedEvent.tickets?.[0]?.price).toFixed(2)}`}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleRSVP}
              disabled={userRsvps.has(selectedEvent.id) || isRsvping}
              className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isRsvping ? "Processing..." : userRsvps.has(selectedEvent.id) ? "Already RSVP'd" : "RSVP Now"}
            </button>
          </div>
        </Modal>
      )}

      {responseModal && (
        <Modal show={!!responseModal} onClose={closeResponse} maxWidth="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{responseModal.title}</h2>
          <p className="text-slate-600 mb-6">{responseModal.message}</p>
          <div className="flex justify-end">
            <button onClick={closeResponse} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200 cursor-pointer">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
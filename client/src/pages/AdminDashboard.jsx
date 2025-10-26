import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronDown, Download, FileText } from "../components/Icons";

const AdminDashboard = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTicketType, setFilterTicketType] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}/events/my-events`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch your events. Please ensure you are logged in as an organizer.");
      }

      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const fetchEventDetails = useCallback(async () => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      setStats(null);
      setAttendees([]);
      return;
    };
    try {
      setLoading(true);
      setError("");

      const eventRes = await fetch(`${BASE_URL}/events/${selectedEventId}`, {
        credentials: "include",
      });
      if (!eventRes.ok) throw new Error("Failed to fetch event details");
      const eventData = await eventRes.json();
      setSelectedEvent(eventData.event || eventData);

      const statsRes = await fetch(`${BASE_URL}/events/${selectedEventId}/stats`, {
        credentials: "include",
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const attendeesRes = await fetch(`${BASE_URL}/rsvps/event/${selectedEventId}`, {
        credentials: "include",
      });
      if (!attendeesRes.ok) throw new Error("Failed to fetch attendees");
      const attendeesData = await attendeesRes.json();
      const rsvps = Array.isArray(attendeesData.rsvps) ? attendeesData.rsvps : [];

      const enrichedAttendees = await Promise.all(
        rsvps.map((rsvp) => fetchUserData(rsvp))
      );
      const validAttendees = enrichedAttendees.filter(
        (attendee) => attendee && attendee.name && attendee.email
      );
      setAttendees(validAttendees);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err.message);
      setAttendees([]);
      setFilteredAttendees([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, BASE_URL]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

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
        ...rsvp,
        ...userData,
        key_id: rsvp.id || userData.id,
      };
    } catch (err) {
      console.error(`Error fetching user ${rsvp.user_id}:`, err);
      return null;
    }
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = attendees.filter((attendee) => {
      const matchesSearch =
        attendee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || attendee.status === filterStatus;
      const matchesTicketType = filterTicketType === "all" || attendee.ticket_type === filterTicketType;
      return matchesSearch && matchesStatus && matchesTicketType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "email": return (a.email || "").localeCompare(b.email || "");
        case "date": return new Date(b.created_at) - new Date(a.created_at);
        case "ticket": return (a.ticket_type || "").localeCompare(b.ticket_type || "");
        default: return 0;
      }
    });

    setFilteredAttendees(filtered);
  }, [attendees, searchTerm, filterStatus, filterTicketType, sortBy]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterTicketType("all");
    setSortBy("name");
    setMobileFiltersOpen(false);
  };

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    resetFilters();
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Status"];
    const rows = filteredAttendees.map(a => [a.name, a.email, a.role, a.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEvent?.title || "attendees"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(selectedEvent?.title || "Attendees", 14, 15);
    const tableColumn = ["Name", "Email", "Role", "Status"];
    const tableRows = filteredAttendees.map(a => [a.name, a.email, a.role, a.status]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 107, 107] },
    });
    doc.save(`${selectedEvent?.title || "attendees"}.pdf`);
  };

  const renderStatCard = (label, value, bgColor, textColor) => (
    <div className={`bg-gradient-to-br ${bgColor} rounded-lg p-4 sm:p-5 border border-opacity-30 ${textColor.replace("text-", "border-")}`}>
      <p className={`text-xs sm:text-sm ${textColor} font-semibold uppercase tracking-wide`}>{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );

  const renderEventSummary = () => (
    <div className="mb-6 sm:mb-8 bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 line-clamp-2">{selectedEvent?.title}</h2>
      <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base line-clamp-2">{selectedEvent?.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {renderStatCard("Total Attendees", stats?.total_rsvps || 0, "from-blue-50 to-blue-100", "text-black")}
        {renderStatCard("Total Revenue", `$${parseFloat(stats?.total_revenue || 0).toFixed(2)}`, "from-green-50 to-green-100", "text-black")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm border-t pt-4">
        <div>
          <p className="text-slate-600 font-semibold">Date</p>
          <p className="text-slate-900 truncate">{new Date(selectedEvent?.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold">Time</p>
          <p className="text-slate-900 truncate">{selectedEvent?.time || "TBA"}</p>
        </div>
        <div>
          <p className="text-slate-600 font-semibold">Location</p>
          <p className="text-slate-900 truncate">{selectedEvent?.location || "TBA"}</p>
        </div>
      </div>
    </div>
  );

  const renderFilterSection = () => (
    <div>
      <div className="lg:hidden p-3 sm:p-4 border-b border-slate-200 bg-slate-50">
        <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="w-full flex items-center justify-between text-slate-900 font-semibold hover:text-slate-700 transition">
          <span className="text-sm">Filters & Sort</span>
          <ChevronDown size={18} className={`transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div className={`${mobileFiltersOpen ? "block" : "hidden lg:block"} p-4 sm:p-6 border-b border-slate-200 bg-slate-50 transition-all`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Search</label>
            <input type="text" placeholder="Name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm">
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm">
              <option value="name">Name (A-Z)</option>
              <option value="email">Email (A-Z)</option>
              <option value="date">Date (Newest First)</option>
            </select>
          </div>
        </div>
        <button onClick={resetFilters} className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 underline">
          Clear All Filters
        </button>
      </div>
    </div>
  );

  const renderAttendeeTable = () => (
    <>
      {loading && !attendees.length ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">Loading attendees...</p>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-slate-500">
          <p className="text-lg sm:text-2xl font-bold text-slate-700 mb-2">📋 No attendees found</p>
          <p className="text-xs sm:text-sm mt-1">{searchTerm || filterStatus !== "all" || filterTicketType !== "all" ? "Try adjusting your filters" : "No one has registered yet"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-900">Name</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-900 hidden sm:table-cell">Email</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-900 hidden lg:table-cell">Role</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee, idx) => (
                <tr key={attendee.key_id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-slate-900 text-xs sm:text-sm">
                    <div className="line-clamp-1">{attendee.name}</div>
                    <a href={`mailto:${attendee.email}`} className="text-rose-600 hover:text-rose-700 underline text-xs sm:hidden" title={`Send email to ${attendee.email}`}>
                      {attendee.email}
                    </a>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-600 hidden sm:table-cell">
                    <a href={`mailto:${attendee.email}`} className="text-rose-600 hover:text-rose-700 underline truncate block text-xs sm:text-sm" title={`Send email to ${attendee.email}`}>
                      {attendee.email}
                    </a>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-block ${attendee.role === "organizer" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}`}>
                      {attendee.role === "organizer" ? "Organizer" : "Attendee"}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-block ${attendee.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {attendee.status === "confirmed" ? "✓ Confirmed" : "✗ Cancelled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredAttendees.length > 0 && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 text-xs sm:text-sm text-slate-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            Showing <span className="font-semibold text-slate-900">{filteredAttendees.length}</span> of <span className="font-semibold text-slate-900">{attendees.length}</span>{" "}
            {(searchTerm || filterStatus !== "all" || filterTicketType !== "all") && (<span className="text-slate-500">(filtered)</span>)}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl text-slate-900 mb-1 sm:mb-2 font-sans line-clamp-1">Admin Dashboard</h1>
          <p className="text-slate-600 text-sm sm:text-base">Track RSVPs, manage attendees.</p>
        </div>
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>{error}</span>
            <button onClick={fetchMyEvents} className="text-xs sm:text-sm font-semibold underline hover:no-underline whitespace-nowrap">Retry</button>
          </div>
        )}
        <div className="mb-6 sm:mb-8">
          <label className="block text-slate-700 font-semibold mb-2 text-sm sm:text-base">Select Event</label>
          <select value={selectedEventId} onChange={(e) => handleEventChange(e.target.value)} className="w-full border border-slate-300 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium text-sm sm:text-base">
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </option>
            ))}
          </select>
        </div>
        {selectedEventId ? (
          <>
            {selectedEvent && stats && renderEventSummary()}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4 sm:mb-6">
              {renderFilterSection()}
              {renderAttendeeTable()}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 p-4 sm:p-6 border border-slate-200 rounded-lg bg-white">
              <h3 className="text-lg sm:text-2xl font-semibold text-slate-900">Export attendee details</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button disabled={filteredAttendees.length === 0} onClick={exportToCSV} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${filteredAttendees.length === 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                  <Download size={16} />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
                <button disabled={filteredAttendees.length === 0} onClick={exportToPDF} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${filteredAttendees.length === 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}>
                  <FileText size={16} />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-lg border border-slate-200">
            <p className="text-xl sm:text-2xl font-bold text-slate-700 mb-2">Select an Event</p>
            <p className="text-slate-600 text-sm sm:text-lg px-4">Choose an event from the dropdown above to view all attendees and analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

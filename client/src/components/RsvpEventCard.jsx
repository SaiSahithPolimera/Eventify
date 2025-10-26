import { useState, useMemo } from "react";
import Modal from "./Modal";

const formatGoogleCalendarDate = (date, time) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");

  const [hours, minutes] = time.split(":").map(Number);
  const start = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    hours,
    minutes
  );
  if (isNaN(start.getTime())) throw new Error("Invalid time");

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const toGoogleDate = (d) =>
    d.toISOString().replace(/[-:.]/g, "").slice(0, -3) + "Z";

  return {
    startDate: toGoogleDate(start),
    endDate: toGoogleDate(end),
  };
};

const generateGoogleCalendarUrl = (event) => {
  const { startDate, endDate } = formatGoogleCalendarDate(
    event.date,
    event.time
  );
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || "No description provided",
    location: event.location || "",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
};

const RsvpEventCard = ({ event, onCancelRsvp, isCanceling }) => {
  const [modal, setModal] = useState({ type: null, data: null });

  const ticket = event.tickets?.[0];
  const price = ticket ? parseFloat(ticket.price) : 0;

  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal({ type: null, data: null });

  const googleCalendarUrl = useMemo(() => {
    try {
      return generateGoogleCalendarUrl(event);
    } catch (error) {
      console.error("Failed to generate calendar URL:", error.message);
      return null;
    }
  }, [event]);

  const handleAddToCalendar = () => {
    if (googleCalendarUrl) {
      window.open(googleCalendarUrl, "_blank");
    } else {
      openModal("response", {
        title: "Error",
        message: "Unable to generate calendar link. The event date or time may be invalid.",
        type: "error",
      });
    }
  };

  const handleCancelRsvpConfirm = () => {
    closeModal();
    onCancelRsvp(event.rsvp_id);
  };

  return (
    <>
      {modal.type === "response" && (
        <Modal show={true} onClose={closeModal} maxWidth="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {modal.data.title}
          </h2>
          <p className="text-slate-600 mb-6">{modal.data.message}</p>
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-semibold hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {modal.type === "confirm" && (
        <Modal show={true} onClose={closeModal} maxWidth="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Cancel RSVP?
          </h2>
          <p className="text-slate-600 mb-6">
            Are you sure you want to cancel your RSVP for "{event.title}"? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 bg-slate-100 cursor-pointer text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200"
            >
              Keep RSVP
            </button>
            <button
              onClick={handleCancelRsvpConfirm}
              disabled={isCanceling}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold  cursor-pointer hover:bg-red-700 disabled:opacity-60"
            >
              {isCanceling ? "Cancelling..." : "Cancel RSVP"}
            </button>
          </div>
        </Modal>
      )}

      <div className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                  {event.title}
                </h3>
                <span className="inline-block px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-md">
                  RSVP Confirmed
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
            {event.description || "No description provided"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Date:</span>
              <span className="line-clamp-1">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Time:</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
              <span className="font-semibold flex-shrink-0">Location:</span>
              <span className="break-words line-clamp-1">
                {event.location}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Type:</span>
              <span className="capitalize">{event.locationType || "physical"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Price:</span>
              <span>{price === 0 ? "Free" : `$${price.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAddToCalendar}
              className="px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add to Calendar
            </button>
            <button
              onClick={() => openModal("confirm")}
              disabled={isCanceling}
              className={`px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all ${isCanceling
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100  active:scale-95"
                }`}
            >
              {isCanceling ? "Cancelling..." : "Cancel RSVP"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RsvpEventCard;
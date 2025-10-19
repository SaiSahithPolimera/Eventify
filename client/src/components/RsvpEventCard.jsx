import { useState } from "react";
import ResponseModal from "./ResponseModal";
import ConfirmationModal from "./ConfirmationModal";

const RsvpEventCard = ({ event, onCancelRsvp, isCanceling }) => {
  const [responseModal, setResponseModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

  const ticket = event.tickets && event.tickets.length > 0 ? event.tickets[0] : null;
  const price = ticket ? parseFloat(ticket.price) : 0;

  const showResponse = (title, message, type = "success") => {
    setResponseModal({ title, message, type });
  };

  const closeResponse = () => {
    setResponseModal(null);
  };

  const showConfirmation = () => {
    setConfirmationModal(true);
  };

  const closeConfirmation = () => {
    setConfirmationModal(false);
  };

  const formatGoogleCalendarDate = (date, time) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) throw new Error("Invalid date");

      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth();
      const day = parsedDate.getDate();

      const [hours, minutes, seconds = "00"] = time.split(":").map(Number);

      const start = new Date(year, month, day, hours, minutes, seconds);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      const toGoogleDate = (d) =>
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      return {
        startDate: toGoogleDate(start),
        endDate: toGoogleDate(end),
      };
    } catch (err) {
      console.error("Error formatting Google Calendar date:", err);
      showResponse("Error", "Failed to format calendar date", "error");
      return { startDate: "", endDate: "" };
    }
  };

  const generateGoogleCalendarUrl = (event) => {
    const { startDate, endDate } = formatGoogleCalendarDate(event.date, event.time);

    if (!startDate || !endDate) {
      return null;
    }

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || "No description provided",
      location: event.location || "",
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = () => {
    const googleCalendarUrl = generateGoogleCalendarUrl(event);
    if (googleCalendarUrl) {
      window.open(googleCalendarUrl, "_blank");
    } else {
      showResponse("Error", "Unable to generate calendar link", "error");
    }
  };

  const handleCancelRsvpConfirm = async () => {
    closeConfirmation();
    try {
      await onCancelRsvp(event.rsvp_id);
    } catch (err) {
      showResponse("Error", err.message || "Failed to cancel RSVP", "error");
    }
  };

  const googleCalendarUrl = generateGoogleCalendarUrl(event);

  return (
    <>
      {responseModal && (
        <ResponseModal
          title={responseModal.title}
          message={responseModal.message}
          type={responseModal.type}
          onClose={closeResponse}
        />
      )}

      {confirmationModal && (
        <ConfirmationModal
          title="Cancel RSVP?"
          message={`Are you sure you want to cancel your RSVP for "${event.title}"? This action cannot be undone.`}
          confirmText="Cancel RSVP"
          cancelText="Keep RSVP"
          onConfirm={handleCancelRsvpConfirm}
          onCancel={closeConfirmation}
          isLoading={isCanceling}
          isDangerous={true}
        />
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
              <span className="break-words line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Type:</span>
              <span className="capitalize">{event.locationType}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold flex-shrink-0">Price:</span>
              <span>{price === 0 ? "Free" : `$${price.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAddToCalendar}
              disabled={!googleCalendarUrl}
              className="px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add to Calendar
            </button>
            <button
              onClick={showConfirmation}
              disabled={isCanceling}
              className={`px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all ${isCanceling
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95"
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
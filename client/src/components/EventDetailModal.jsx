import { useState } from "react";
import TicketDetails from "./TicketDetails";

const EventDetailModal = ({
  selectedEvent,
  userRsvps,
  onClose,
  onRsvp,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedEvent) return null;

  const handleRsvpClick = async () => {
    setIsLoading(true);
    try {
      await onRsvp();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-2xl relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {selectedEvent.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {selectedEvent.description || "No description provided"}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-start p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-sm font-bold text-rose-600">D</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-700 text-xs sm:text-sm uppercase tracking-wide">
                Date & Time
              </p>
              <p className="text-slate-900 font-medium mt-1 text-sm sm:text-base break-words">
                {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm">at {selectedEvent.time}</p>
            </div>
          </div>

          <div className="flex items-start p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-sm font-bold text-rose-600">L</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-700 text-xs sm:text-sm uppercase tracking-wide">
                Location
              </p>
              <p className="text-slate-900 font-medium mt-1 text-sm sm:text-base break-words">
                {selectedEvent.location}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm capitalize">
                {selectedEvent.locationType}
              </p>
            </div>
          </div>
        </div>

        {selectedEvent.tickets && selectedEvent.tickets.length > 0 ? (
          <>
            <TicketDetails tickets={selectedEvent.tickets} />

            {(() => {
              const hasRsvpd = userRsvps.has(selectedEvent.id);
              const ticket = selectedEvent.tickets[0];
              const isSoldOut = parseInt(ticket.quantity) <= 0;

              return (
                <button
                  onClick={handleRsvpClick}
                  disabled={hasRsvpd || isSoldOut || isLoading}
                  className={`w-full py-3 rounded-lg font-semibold text-base sm:text-lg transition-all mt-6 cursor-pointer ${
                    isLoading
                      ? "bg-rose-600 text-white opacity-80"
                      : hasRsvpd
                      ? "bg-rose-100 text-rose-700 border border-rose-200 cursor-not-allowed"
                      : isSoldOut
                      ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                      : "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : hasRsvpd ? (
                    "You Are Already Going"
                  ) : isSoldOut ? (
                    "No Tickets Available"
                  ) : (
                    "RSVP Now"
                  )}
                </button>
              );
            })()}
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-2xl sm:text-3xl mb-3 font-bold text-slate-700">ℹ️</p>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              Information Only Event
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              This event does not have tickets available for RSVP. Please contact
              the organizer for more details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailModal;
import EventInfo from "./EventInfo";

const EventCard = ({ event, userRsvps, onSelect }) => {
  const hasTickets = event.tickets && event.tickets.length > 0;
  const ticket = hasTickets ? event.tickets[0] : null;
  const isFree = ticket ? parseFloat(ticket.price) === 0 : false;
  const ticketQuantity = ticket ? parseInt(ticket.quantity) : 0;
  const isSoldOut = ticketQuantity <= 0;
  const hasRsvpd = userRsvps.has(event.id);

  const getButtonState = () => {
    if (hasRsvpd) {
      return {
        label: "Going",
        disabled: true,
        className:
          "px-4 py-2 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 cursor-not-allowed",
      };
    }
    if (isSoldOut) {
      return {
        label: "Sold Out",
        disabled: true,
        className:
          "px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed",
      };
    }
    if (!hasTickets) {
      return {
        label: "View Info",
        disabled: true,
        className:
          "px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed",
      };
    }
    return {
      label: "RSVP",
      disabled: false,
      className:
        "px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer",
    };
  };

  const buttonState = getButtonState();

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={() => onSelect(event)}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between p-6">
        <EventInfo
          event={event}
          hasTickets={hasTickets}
          hasRsvpd={hasRsvpd}
          isSoldOut={isSoldOut}
          isFree={isFree}
          ticket={ticket}
          ticketQuantity={ticketQuantity}
        />

        <div className="flex-shrink-0">
          <button
            disabled={buttonState.disabled}
            className={buttonState.className}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event);
            }}
          >
            {buttonState.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
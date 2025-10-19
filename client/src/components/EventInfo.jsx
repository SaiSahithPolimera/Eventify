const EventInfo = ({ event, hasTickets, hasRsvpd, isSoldOut, isFree, ticket, ticketQuantity }) => {
  const getStatusBadge = () => {
    if (!hasTickets) {
      return <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded">Info Only</span>;
    }
    if (hasRsvpd) {
      return <span className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-100 rounded">Confirmed</span>;
    }
    if (isSoldOut) {
      return <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded">Sold Out</span>;
    }
    if (isFree) {
      return <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded">Free</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded">${parseFloat(ticket.price).toFixed(2)}</span>;
  };

  const getTicketStatus = () => {
    if (isSoldOut) return { text: 'No tickets available', color: 'text-slate-500' };
    if (ticketQuantity < 10) return { text: `${ticketQuantity} left`, color: 'text-orange-600' };
    return { text: `${ticketQuantity} left`, color: 'text-emerald-600' };
  };

  const ticketStatus = getTicketStatus();

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 line-clamp-1">
              {event.title}
            </h3>
            {getStatusBadge()}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
            {event.description || "No description provided"}
          </p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold">Date:</span>
              <span className="line-clamp-1">
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold">Time:</span>
              <span>{event.time}</span>
            </div>
            
            <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold">Location:</span>
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {hasTickets && (
              <div className={`col-span-2 sm:col-span-1 flex items-center gap-1.5 font-medium ${ticketStatus.color}`}>
                <span className="font-semibold">Tickets:</span>
                <span>{ticketStatus.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfo;
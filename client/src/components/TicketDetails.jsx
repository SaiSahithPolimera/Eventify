const TicketDetails = ({ tickets }) => {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Ticket Details</h3>

      {tickets.map((ticket) => {
        const ticketQuantity = parseInt(ticket.quantity);
        const isSoldOut = ticketQuantity <= 0;
        const isLowStock = ticketQuantity > 0 && ticketQuantity < 10;
        const price = parseFloat(ticket.price);

        return (
          <div key={ticket.id} className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
                </p>
                <p className="text-sm text-slate-600 capitalize">{ticket.type} Ticket</p>
              </div>

              <div className="text-right">
                {isSoldOut ? (
                  <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-md text-sm font-semibold">
                    SOLD OUT
                  </span>
                ) : (
                  <>
                    <p
                      className={`text-lg font-bold ${
                        isLowStock ? "text-orange-600" : "text-emerald-600"
                      }`}
                    >
                      {ticketQuantity} left
                    </p>
                    {isLowStock && (
                      <p className="text-xs text-orange-600 font-semibold">
                        Limited availability
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Ticket ID:</span> {ticket.id} |
                <span className="font-semibold ml-2">Event ID:</span> {ticket.event_id}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketDetails;
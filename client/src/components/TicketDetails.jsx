const TicketDetails = ({ tickets }) => {
  return (
    <div className="space-y-3 mb-6">
      {tickets.map((ticket) => {
        const ticketQuantity = parseInt(ticket.quantity);
        const isSoldOut = ticketQuantity <= 0;
        const isLowStock = ticketQuantity > 0 && ticketQuantity < 10;
        const price = parseFloat(ticket.price);
        const isFree = price === 0;

        return (
          <div
            key={ticket.id}
            className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-md sm:text-base font-semibold text-slate-900 capitalize">
                  {ticket.type} Ticket
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-bold text-slate-900">
                    {isFree ? "" : `$${price.toFixed(2)}`}
                  </p>
                </div>

                <div>
                  {isSoldOut ? (
                    <span className="inline-block bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                      Sold Out
                    </span>
                  ) : (
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-bold ${isLowStock ? "text-orange-600" : "text-emerald-600"
                          }`}
                      >
                        {ticketQuantity} left
                      </p>
                      {isLowStock && (
                        <p className="text-xs text-orange-600 font-semibold mt-1">
                          Hurry!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketDetails;
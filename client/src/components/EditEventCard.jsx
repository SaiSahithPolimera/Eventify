const EditEventCard = ({ event, ticket, stats, handleEdit, handleDeleteClick }) => {
  return (
    <div
      key={event.id}
      className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-slate-600 mb-3 line-clamp-3">
              {event.description || "No description"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4"> 
              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-semibold w-16 flex-shrink-0">Date:</span>
                <span className="truncate">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="font-semibold w-16 flex-shrink-0">Time:</span>
                <span className="truncate">{event.time || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 sm:col-span-2">
                <span className="font-semibold w-16 flex-shrink-0">Location:</span>
                <span className="truncate">{event.location || "N/A"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {ticket && (
                <>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
                    <span className="font-semibold text-slate-700">Ticket:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                        ticket.type === "free"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {ticket.type === "free" ? "Free" : `$${parseFloat(ticket.price).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
                    <span className="font-semibold text-slate-700">Available:</span>
                    <span className="text-slate-600">{ticket.quantity}</span>
                  </div>
                </>
              )}
              {stats && (
                <>
                  <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded">
                    <span className="font-semibold text-blue-700">RSVPs:</span>
                    <span className="text-blue-700">{stats.total_rsvps || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded">
                    <span className="font-semibold text-green-700">Revenue:</span>
                    <span className="text-green-700">${parseFloat(stats.total_revenue || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 flex-shrink-0">
            <button
              onClick={() => handleEdit(event)}
              className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer text-center"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(event.id)}
              className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200 cursor-pointer text-center"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventCard;
const EventInfo = ({ event, hasTickets, hasRsvpd, isSoldOut, isFree, ticket, ticketQuantity }) => {
    return (
        <div className="flex-1">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-rose-600">E</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                            {event.title}
                        </h3>
                        {!hasTickets ? (
                            <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md">
                                Info Only
                            </span>
                        ) : hasRsvpd ? (
                            <span className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-100 rounded-md">
                                Confirmed
                            </span>
                        ) : isSoldOut ? (
                            <span className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md">
                                Sold Out
                            </span>
                        ) : isFree ? (
                            <span className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-md">
                                Free
                            </span>
                        ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md">
                                ${parseFloat(ticket.price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                        {event.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-semibold">Date:</span>
                            <span>
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
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="font-semibold">Location:</span>
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                        {hasTickets && (
                            <div className={`flex items-center gap-1.5 font-medium ${hasRsvpd
                                    ? 'text-rose-600'
                                    : isSoldOut
                                        ? 'text-slate-500'
                                        : ticketQuantity < 10
                                            ? 'text-orange-600'
                                            : 'text-emerald-600'
                                }`}>
                                <span className="font-semibold">Tickets:</span>
                                <span>
                                    {hasRsvpd
                                        ? 'You have a ticket'
                                        : isSoldOut
                                            ? 'No tickets available'
                                            : `${ticketQuantity} tickets left`
                                    }
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventInfo;
const RsvpEventCard = ({ event, onCancelRsvp, isCanceling }) => {
  const ticket = event.tickets && event.tickets.length > 0 ? event.tickets[0] : null;
  const price = ticket ? parseFloat(ticket.price) : 0;

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
      return { startDate: "", endDate: "" };
    }
  };

  const generateGoogleCalendarUrl = (event) => {
    const { startDate, endDate } = formatGoogleCalendarDate(event.date, event.time);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || "No description provided",
      location: event.location || "",
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  const googleCalendarUrl = generateGoogleCalendarUrl(event);

  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-emerald-600">✓</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {event.title}
              </h3>
              <span className="inline-block px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-md">
                RSVP Confirmed
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          {event.description || "No description provided"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">Date:</span>
            <span>
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">Time:</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 md:col-span-2">
            <span className="font-semibold">Location:</span>
            <span className="break-words">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">Type:</span>
            <span className="capitalize">{event.locationType}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">Ticket Price:</span>
            <span>{price === 0 ? "Free" : `$${price.toFixed(2)}`}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
          >
            Add to Google Calendar
          </a>
          <button
            onClick={() => onCancelRsvp(event.rsvp_id)}
            disabled={isCanceling}
            className={`px-4 py-2 rounded-lg font-semibold cursor-pointer text-sm transition-all ${
              isCanceling
                ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60"
                : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            }`}
          >
            {isCanceling ? "Cancelling..." : "Cancel RSVP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RsvpEventCard;
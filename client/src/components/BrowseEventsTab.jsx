import EventCard from "./EventCard";

const BrowseEventsTab = ({
  filtered,
  userRsvps,
  setSelectedEvent,
}) => {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-4xl mb-4 font-bold text-slate-700">No Events</p>
        <p className="text-slate-600 text-lg font-medium mb-2">No events found</p>
        <p className="text-slate-500 text-sm">
          Try adjusting your filters or create a new event
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          userRsvps={userRsvps}
          onSelect={setSelectedEvent}
        />
      ))}
    </div>
  );
};

export default BrowseEventsTab;
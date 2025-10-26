import RsvpEventCard from "./RsvpEventCard";

const MyRsvpTab = ({
  rsvpdEvents,
  loadingRsvpdEvents,
  onCancelRsvp,
  cancelingRsvp,
  setActiveTab,
}) => {
  if (loadingRsvpdEvents) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-slate-600">
          Loading your RSVP'd events...
        </p>
      </div>
    );
  }

  if (rsvpdEvents.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-4xl mb-4 font-bold text-slate-700">No RSVP'd Events</p>
        <p className="text-slate-600 text-lg font-medium mb-2">
          You haven't RSVP'd to any events yet
        </p>
        <p className="text-slate-500 text-sm">Browse events and RSVP to get started</p>
        <button
          onClick={() => setActiveTab("browse")}
          className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
        >
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rsvpdEvents.map((event) => (
        <RsvpEventCard
          key={event.id}
          event={event}
          onCancelRsvp={onCancelRsvp}
          isCanceling={cancelingRsvp === event.rsvp_id}
        />
      ))}
    </div>
  );
};

export default MyRsvpTab;
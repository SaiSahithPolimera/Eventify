const EventFormSection = ({ form, setForm, today }) => {
  return (
    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="event-title" className="text-slate-700 font-medium mb-2">Event Title *</label>
          <input
            id="event-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="e.g., Summer Music Festival 2024"
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="event-date" className="text-slate-700 font-medium mb-2">Date *</label>
          <input
            id="event-date"
            type="date"
            value={form.date}
            min={today}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="event-time" className="text-slate-700 font-medium mb-2">Time *</label>
          <input
            id="event-time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="location-type" className="text-slate-700 font-medium mb-2">Location Type *</label>
          <select
            id="location-type"
            value={form.locationType}
            onChange={(e) => setForm({ ...form, locationType: e.target.value })}
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
          >
            <option value="physical">Physical</option>
            <option value="virtual">Virtual</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="event-location" className="text-slate-700 font-medium mb-2">
            {form.locationType === "virtual" ? "Meeting Link *" : "Venue Address *"}
          </label>
          <input
            id="event-location"
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
            placeholder={
              form.locationType === "virtual"
                ? "https://meet.google.com/..."
                : "123 Main St, City, State"
            }
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label htmlFor="event-description" className="text-slate-700 font-medium mb-2">Description</label>
          <textarea
            id="event-description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="3"
            placeholder="Describe what makes your event special..."
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default EventFormSection;
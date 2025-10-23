const EventForm = ({ form, setForm, today }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">Event Title *</label>
                <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="Event title"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none transition-all"
                    placeholder="Event description"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-slate-700 font-medium mb-2">Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        min={today}
                        onChange={handleInputChange}
                        className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-700 font-medium mb-2">Time *</label>
                    <input
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleInputChange}
                        className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-slate-700 font-medium mb-2">Location *</label>
                <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="Event location"
                />
            </div>

            <div className="pt-5 border-t border-slate-200">
                <h4 className="text-xl font-semibold text-slate-800 mb-4">
                    Ticket Details
                </h4>
                <div className="space-y-5">
                    <div className="flex flex-col">
                        <label className="text-slate-700 font-medium mb-2">
                            Ticket Type *
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="ticketType"
                                    value="free"
                                    checked={form.ticketType === "free"}
                                    onChange={handleInputChange}
                                    className="form-radio text-rose-600 focus:ring-rose-500"
                                />
                                <span className="text-slate-700">Free</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="ticketType"
                                    value="paid"
                                    checked={form.ticketType === "paid"}
                                    onChange={handleInputChange}
                                    className="form-radio text-rose-600 focus:ring-rose-500"
                                />
                                <span className="text-slate-700">Paid</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {form.ticketType === "paid" && (
                            <div className="flex flex-col">
                                <label className="text-slate-700 font-medium mb-2">
                                    Ticket Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="ticketPrice"
                                    value={form.ticketPrice}
                                    onChange={handleInputChange}
                                    className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    placeholder="e.g., 10.00"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        )}

                        <div
                            className={`flex flex-col ${form.ticketType === "free" ? "col-span-2" : ""
                                }`}
                        >
                            <label className="text-slate-700 font-medium mb-2">
                                Ticket Quantity *
                            </label>
                            <input
                                type="number"
                                name="ticketQuantity"
                                value={form.ticketQuantity}
                                onChange={handleInputChange}
                                className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                placeholder="e.g., 100"
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
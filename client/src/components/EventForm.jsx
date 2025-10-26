const EventForm = ({ form, setForm, today, errors = {} }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const commonInputClasses = "w-full border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500";
    const errorInputClasses = "border-red-400 focus:ring-red-500";

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                    Event Title
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={form.title}
                    onChange={handleChange}
                    className={`${commonInputClasses} ${errors.title ? errorInputClasses : ''}`}
                    placeholder="e.g., Summer Music Festival"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={form.description}
                    onChange={handleChange}
                    className={`${commonInputClasses} ${errors.description ? errorInputClasses : ''}`}
                    placeholder="Briefly describe your event"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        id="date"
                        min={today}
                        value={form.date}
                        onChange={handleChange}
                        className={`${commonInputClasses} ${errors.date ? errorInputClasses : ''}`}
                    />
                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">
                        Time
                    </label>
                    <input
                        type="time"
                        name="time"
                        id="time"
                        value={form.time}
                        onChange={handleChange}
                        className={`${commonInputClasses} ${errors.time ? errorInputClasses : ''}`}
                    />
                    {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                    Location or URL
                </label>
                <input
                    type="text"
                    name="location"
                    id="location"
                    value={form.location}
                    onChange={handleChange}
                    className={`${commonInputClasses} ${errors.location ? errorInputClasses : ''}`}
                    placeholder="e.g., Central Park, New York"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div className="pt-4 border-t border-slate-200">
                <h4 className="text-md font-semibold text-slate-800 mb-2">Ticket Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label htmlFor="ticketType" className="block text-sm font-medium text-slate-700 mb-1">
                            Type
                        </label>
                        <select
                            name="ticketType"
                            id="ticketType"
                            value={form.ticketType}
                            onChange={handleChange}
                            className={`${commonInputClasses} ${errors.ticketType ? errorInputClasses : ''}`}
                        >
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                        {errors.ticketType && <p className="mt-1 text-sm text-red-600">{errors.ticketType}</p>}
                    </div>
                    {form.ticketType === 'paid' && (
                        <div>
                            <label htmlFor="ticketPrice" className="block text-sm font-medium text-slate-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                name="ticketPrice"
                                id="ticketPrice"
                                value={form.ticketPrice}
                                onChange={handleChange}
                                className={`${commonInputClasses} ${errors.ticketPrice ? errorInputClasses : ''}`}
                                placeholder="e.g., 25.00"
                                min="0"
                                step="0.01"
                            />
                            {errors.ticketPrice && <p className="mt-1 text-sm text-red-600">{errors.ticketPrice}</p>}
                        </div>
                    )}
                    <div>
                        <label htmlFor="ticketQuantity" className="block text-sm font-medium text-slate-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="ticketQuantity"
                            id="ticketQuantity"
                            value={form.ticketQuantity}
                            onChange={handleChange}
                            className={`${commonInputClasses} ${errors.ticketQuantity ? errorInputClasses : ''}`}
                            placeholder="e.g., 100"
                            min="0"
                        />
                        {errors.ticketQuantity && <p className="mt-1 text-sm text-red-600">{errors.ticketQuantity}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
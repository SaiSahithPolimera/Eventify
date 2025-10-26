const Filterbar = ({ filters, setFilters, filtered }) => {
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 border border-rose-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-rose-600">Filter Events</h2>
                <span className="text-sm font-medium text-rose-400">
                    {filtered.length} {filtered.length === 1 ? "event" : "events"}{" "}
                    found
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="location-filter" className="text-rose-600 font-semibold mb-2 text-sm">
                        Location
                    </label>
                    <input
                        id="location-filter"
                        type="text"
                        value={filters.location}
                        onChange={(e) =>
                            setFilters({ ...filters, location: e.target.value })
                        }
                        placeholder="Search by location..."
                        className="border border-rose-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="date-filter" className="text-rose-600 font-semibold mb-2 text-sm">
                        Date
                    </label>
                    <input
                        id="date-filter"
                        type="date"
                        value={filters.date}
                        onChange={(e) =>
                            setFilters({ ...filters, date: e.target.value })
                        }
                        className="border border-rose-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="price-filter" className="text-rose-600 font-semibold mb-2 text-sm">
                        Price Type
                    </label>
                    <select
                        id="price-filter"
                        value={filters.price}
                        onChange={(e) =>
                            setFilters({ ...filters, price: e.target.value })
                        }
                        className="border border-rose-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all cursor-pointer"
                    >
                        <option value="all">All Events</option>
                        <option value="free">Free Events</option>
                        <option value="paid">Paid Events</option>
                    </select>
                </div>
            </div>

            {(filters.location || filters.date || filters.price !== "all") && (
                <button
                    onClick={() =>
                        setFilters({ location: "", date: "", price: "all" })
                    }
                    className="mt-4 text-rose-500 hover:text-rose-600 font-medium text-sm underline cursor-pointer transition-colors"
                >
                    Clear all filters
                </button>
            )}
        </div>
    );
};

export default Filterbar;
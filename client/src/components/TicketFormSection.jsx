const TicketFormSection = ({ form, setForm }) => {
  const isPaid = form.ticketType === "paid";
  
  return (
    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Tickets</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <label htmlFor="ticket-type" className="text-slate-700 font-medium mb-2">
            Ticket Type *
          </label>
          <select
            id="ticket-type"
            value={form.ticketType}
            onChange={(e) =>
              setForm({ ...form, ticketType: e.target.value, ticketPrice: "" })
            }
            required
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {isPaid && (
          <div className="flex flex-col">
            <label htmlFor="ticket-price" className="text-slate-700 font-medium mb-2">
              Price *
            </label>
            <input
              id="ticket-price"
              type="number"
              value={form.ticketPrice}
              onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
              required
              min="0.01"
              step="0.01"
              placeholder="e.g., 25.00"
              className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="ticket-quantity" className="text-slate-700 font-medium mb-2">
            Total Tickets *
          </label>
          <input
            id="ticket-quantity"
            type="number"
            value={form.ticketQuantity}
            onChange={(e) =>
              setForm({ ...form, ticketQuantity: e.target.value })
            }
            required
            min="1"
            placeholder="e.g., 100"
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default TicketFormSection;
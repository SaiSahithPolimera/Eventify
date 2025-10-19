const TicketFormSection = ({ form, setForm }) => {
  return (
    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Ticket Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col">
          <label className="text-slate-700 font-medium mb-2">Ticket Type *</label>
          <select
            value={form.ticketType}
            onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
            required
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {form.ticketType === "paid" && (
          <div className="flex flex-col">
            <label className="text-slate-700 font-medium mb-2">Price ($) *</label>
            <input
              type="number"
              value={form.ticketPrice}
              onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
              required={form.ticketType === "paid"}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-slate-700 font-medium mb-2">Total Tickets *</label>
          <input
            type="number"
            value={form.ticketQuantity}
            onChange={(e) => setForm({ ...form, ticketQuantity: e.target.value })}
            required
            min="1"
            placeholder="100"
            className="border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>
      </div>

      {form.ticketQuantity && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Preview:</span> You are creating{" "}
            <span className="font-bold">{form.ticketQuantity}</span>{" "}
            {form.ticketType === "free"
              ? "free tickets"
              : `tickets at $${form.ticketPrice || "0.00"} each`}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketFormSection;
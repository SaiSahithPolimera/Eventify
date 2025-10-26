import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateEventModal from "./CreateEventModal";

vi.mock("./EventFormSection", () => ({
  default: ({ form, setForm }) => (
    <div data-testid="event-form-section">
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Event Name"
      />
    </div>
  ),
}));

vi.mock("./TicketFormSection", () => ({
  default: ({ form, setForm }) => (
    <div data-testid="ticket-form-section">
      <input
        type="number"
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        placeholder="Ticket Quantity"
      />
    </div>
  ),
}));

describe("CreateEventModal Component", () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn((e) => e.preventDefault());
  const setForm = vi.fn();

  const defaultProps = {
    showCreateForm: true,
    onClose,
    form: { name: "", quantity: 0 },
    setForm,
    creating: false,
    onSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when showCreateForm is false", () => {
    render(<CreateEventModal {...defaultProps} showCreateForm={false} />);
    expect(screen.queryByText("Create New Event")).not.toBeInTheDocument();
  });

  it("should render the modal and form sections when showCreateForm is true", () => {
    render(<CreateEventModal {...defaultProps} />);
    expect(screen.getByText("Create New Event")).toBeInTheDocument();
    expect(screen.getByTestId("event-form-section")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-form-section")).toBeInTheDocument();
  });

  it("should call onClose when the close button is clicked", async () => {
    render(<CreateEventModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the cancel button is clicked", async () => {
    render(<CreateEventModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onSubmit when the form is submitted", async () => {
    render(<CreateEventModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /create event & tickets/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should disable the submit button when creating is true", () => {
    render(<CreateEventModal {...defaultProps} creating={true} />);
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
  });
});
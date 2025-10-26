import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EventDetailModal from "./EventDetailModal";

vi.mock("./TicketDetails", () => ({
  default: ({ tickets }) => (
    <div data-testid="ticket-details">{tickets.length} ticket(s)</div>
  ),
}));

describe("EventDetailModal Component", () => {
  const onClose = vi.fn();
  const onRsvp = vi.fn();

  const baseEvent = {
    id: 1,
    title: "Test Event",
    description: "Test Description",
    date: "2025-12-25",
    time: "18:00",
    location: "Test Location",
    locationType: "Online",
    tickets: [{ price: "10.00", quantity: 50 }],
  };

  it("should not render if selectedEvent is null", () => {
    render(<EventDetailModal selectedEvent={null} />);
    expect(screen.queryByText("Test Event")).not.toBeInTheDocument();
  });

  it("should render event details and a RSVP button", () => {
    render(
      <EventDetailModal
        selectedEvent={baseEvent}
        userRsvps={new Set()}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByTestId("ticket-details")).toBeInTheDocument();
    expect(screen.getByText("RSVP Now")).toBeInTheDocument();
  });

  it("should call onClose when the close button is clicked", async () => {
    render(
      <EventDetailModal
        selectedEvent={baseEvent}
        userRsvps={new Set()}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    await userEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onRsvp when the RSVP button is clicked", async () => {
    render(
      <EventDetailModal
        selectedEvent={baseEvent}
        userRsvps={new Set()}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    await userEvent.click(screen.getByText("RSVP Now"));
    expect(onRsvp).toHaveBeenCalledTimes(1);
  });

  it('should show "You Are Already Going" and be disabled if user has RSVPd', () => {
    render(
      <EventDetailModal
        selectedEvent={baseEvent}
        userRsvps={new Set([1])}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    const button = screen.getByText("You Are Already Going");
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeDisabled();
  });

  it('should show "No Tickets Available" and be disabled if tickets are sold out', () => {
    const soldOutEvent = { ...baseEvent, tickets: [{ price: "10.00", quantity: 0 }] };
    render(
      <EventDetailModal
        selectedEvent={soldOutEvent}
        userRsvps={new Set()}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    const button = screen.getByText("No Tickets Available");
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeDisabled();
  });

  it('should show "Information Only Event" if there are no tickets', () => {
    const noTicketEvent = { ...baseEvent, tickets: [] };
    render(
      <EventDetailModal
        selectedEvent={noTicketEvent}
        userRsvps={new Set()}
        onClose={onClose}
        onRsvp={onRsvp}
      />
    );
    expect(screen.getByText("Information Only Event")).toBeInTheDocument();
    expect(screen.queryByText("RSVP Now")).not.toBeInTheDocument();
  });
});

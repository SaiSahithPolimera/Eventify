import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EventCard from "./EventCard";

vi.mock("./EventInfo", () => ({
  default: ({ event }) => <div data-testid="event-info">{event.title}</div>,
}));

describe("EventCard Component", () => {
  const onSelect = vi.fn();

  const baseEvent = {
    id: 1,
    title: "Test Event",
    tickets: [{ price: "10.00", quantity: 50 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render event info and an RSVP button", () => {
    render(<EventCard event={baseEvent} userRsvps={new Set()} onSelect={onSelect} />);
    expect(screen.getByTestId("event-info")).toBeInTheDocument();
    expect(screen.getByText("RSVP")).toBeInTheDocument();
  });

  it("should call onSelect when the card is clicked", async () => {
    render(<EventCard event={baseEvent} userRsvps={new Set()} onSelect={onSelect} />);
    await userEvent.click(screen.getByTestId("event-info"));
    expect(onSelect).toHaveBeenCalledWith(baseEvent);
  });

  it('should show "Going" and be disabled if user has RSVPd', () => {
    render(
      <EventCard event={baseEvent} userRsvps={new Set([1])} onSelect={onSelect} />
    );
    const button = screen.getByText("Going");
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeDisabled();
  });

  it('should show "Sold Out" and be disabled if tickets are sold out', () => {
    const soldOutEvent = { ...baseEvent, tickets: [{ price: "10.00", quantity: 0 }] };
    render(
      <EventCard event={soldOutEvent} userRsvps={new Set()} onSelect={onSelect} />
    );
    const button = screen.getByText("Sold Out");
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeDisabled();
  });

  it('should show "View Info" and be disabled if there are no tickets', () => {
    const noTicketEvent = { ...baseEvent, tickets: [] };
    render(
      <EventCard event={noTicketEvent} userRsvps={new Set()} onSelect={onSelect} />
    );
    const button = screen.getByText("View Info");
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeDisabled();
  });
});
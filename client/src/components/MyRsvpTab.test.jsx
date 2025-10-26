import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MyRsvpTab from "./MyRsvpTab";

vi.mock("./RsvpEventCard", () => ({
  default: ({ event }) => <div data-testid="rsvp-event-card">{event.title}</div>,
}));

describe("MyRsvpsTab Component", () => {
  const onCancelRsvp = vi.fn();
  const setActiveTab = vi.fn();

  const defaultProps = {
    rsvpdEvents: [],
    loadingRsvpdEvents: false,
    onCancelRsvp,
    cancelingRsvp: null,
    setActiveTab,
  };

  it("should display a loading spinner when loading", () => {
    render(<MyRsvpTab {...defaultProps} loadingRsvpdEvents={true} />);
    expect(screen.getByText("Loading your RSVP'd events...")).toBeInTheDocument();
  });

  it('should display "No RSVP\'d Events" message when there are no events', () => {
    render(<MyRsvpTab {...defaultProps} />);
    expect(screen.getByText("No RSVP'd Events")).toBeInTheDocument();
  });

  it('should call setActiveTab when "Browse Events" is clicked', async () => {
    render(<MyRsvpTab {...defaultProps} />);
    await userEvent.click(screen.getByText("Browse Events"));
    expect(setActiveTab).toHaveBeenCalledWith("browse");
  });

  it("should render a list of RSVPd events", () => {
    const rsvpdEvents = [
      { id: 1, title: "Event 1", rsvp_id: 101 },
      { id: 2, title: "Event 2", rsvp_id: 102 },
    ];
    render(<MyRsvpTab {...defaultProps} rsvpdEvents={rsvpdEvents} />);
    const eventCards = screen.getAllByTestId("rsvp-event-card");
    expect(eventCards).toHaveLength(2);
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });
});
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BrowseEventsTab from "./BrowseEventsTab";

vi.mock("./EventCard", () => ({
  default: ({ event }) => <div data-testid="event-card">{event.title}</div>,
}));

describe("BrowseEventsTab Component", () => {
  const userRsvps = [];
  const setSelectedEvent = vi.fn();

  it("should display 'No Events' message when no events are provided", () => {
    render(
      <BrowseEventsTab
        filtered={[]}
        userRsvps={userRsvps}
        setSelectedEvent={setSelectedEvent}
      />
    );
    expect(screen.getByText("No Events")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your filters or create a new event")
    ).toBeInTheDocument();
  });

  it("should render a list of events", () => {
    const events = [
      { id: 1, title: "Event 1" },
      { id: 2, title: "Event 2" },
    ];
    render(
      <BrowseEventsTab
        filtered={events}
        userRsvps={userRsvps}
        setSelectedEvent={setSelectedEvent}
      />
    );
    const eventCards = screen.getAllByTestId("event-card");
    expect(eventCards).toHaveLength(2);
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });
});

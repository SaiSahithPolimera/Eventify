import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EventInfo from "./EventInfo";

describe("EventInfo Component", () => {
  const baseEvent = {
    title: "Tech Conference 2025",
    description: "A conference about the future of tech.",
    date: "2025-12-10",
    time: "09:00",
    location: "Convention Center",
  };

  const baseTicket = {
    type: "paid",
    price: "50.00",
    quantity: 100,
  };

  it("should render event information", () => {
    render(
      <EventInfo
        event={baseEvent}
        ticket={baseTicket}
        hasTickets={true}
        ticketQuantity={100}
      />
    );
    expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
    expect(
      screen.getByText("A conference about the future of tech.")
    ).toBeInTheDocument();
    expect(screen.getByText("Dec 10, 2025")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("Convention Center")).toBeInTheDocument();
  });

  it('should display "Info Only" badge when there are no tickets', () => {
    render(<EventInfo event={baseEvent} hasTickets={false} />);
    expect(screen.getByText("Info Only")).toBeInTheDocument();
  });

  it('should display "Confirmed" badge when user has RSVPd', () => {
    render(
      <EventInfo
        event={baseEvent}
        ticket={baseTicket}
        hasTickets={true}
        hasRsvpd={true}
      />
    );
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it('should display "Sold Out" badge when event is sold out', () => {
    render(
      <EventInfo
        event={baseEvent}
        ticket={{ ...baseTicket, quantity: 0 }}
        hasTickets={true}
        isSoldOut={true}
      />
    );
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it('should display "Free" badge when event is free', () => {
    render(
      <EventInfo
        event={baseEvent}
        ticket={{ ...baseTicket, type: "free" }}
        hasTickets={true}
        isFree={true}
      />
    );
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display the price when event is paid", () => {
    render(
      <EventInfo
        event={baseEvent}
        ticket={{ ...baseTicket, type: "paid", price: "50.00" }}
        hasTickets={true}
        isFree={false}
      />
    );
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  describe("ticket quantity status", () => {
    it("should display the number of tickets left when quantity is high", () => {
      render(
        <EventInfo
          event={baseEvent}
          ticket={baseTicket}
          hasTickets={true}
          ticketQuantity={50}
        />
      );
      expect(screen.getByText(/50 left/i)).toBeInTheDocument();
    });

    it("should display the number of tickets left when quantity is low", () => {
      render(
        <EventInfo
          event={baseEvent}
          ticket={baseTicket}
          hasTickets={true}
          ticketQuantity={9}
        />
      );
      expect(screen.getByText(/9 left/i)).toBeInTheDocument();
    });

    it('should display "No tickets available" when sold out', () => {
      render(
        <EventInfo
          event={baseEvent}
          ticket={{ ...baseTicket, quantity: 0 }}
          hasTickets={true}
          isSoldOut={true}
          ticketQuantity={0}
        />
      );
      expect(screen.getByText(/No tickets available/i)).toBeInTheDocument();
    });

    it("should not display ticket status when there are no tickets", () => {
      render(<EventInfo event={baseEvent} hasTickets={false} />);
      expect(screen.queryByText(/Tickets:/i)).not.toBeInTheDocument();
    });
  });
});
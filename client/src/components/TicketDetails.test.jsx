import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TicketDetails from "./TicketDetails";

describe("TicketDetails Component", () => {
  const mockTickets = [
    {
      id: 1,
      type: "general",
      price: "50.00",
      quantity: "100",
    },
    {
      id: 2,
      type: "vip",
      price: "150.00",
      quantity: "5",
    },
  ];

  it("should render ticket list correctly", () => {
    render(<TicketDetails tickets={mockTickets} />);

    expect(screen.getByText(/general ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/vip ticket/i)).toBeInTheDocument();
  });

  it("should display ticket prices correctly", () => {
    render(<TicketDetails tickets={mockTickets} />);

    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("should display ticket quantities correctly", () => {
    render(<TicketDetails tickets={mockTickets} />);

    expect(screen.getByText("100 left")).toBeInTheDocument();
    expect(screen.getByText("5 left")).toBeInTheDocument();
  });

  it("should show 'Sold Out' when quantity is 0", () => {
    const soldOutTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "0",
      },
    ];

    render(<TicketDetails tickets={soldOutTickets} />);

    expect(screen.getByText("Sold Out")).toBeInTheDocument();
    expect(screen.queryByText("0 left")).not.toBeInTheDocument();
  });

  it("should show low stock warning when quantity is less than 10", () => {
    const lowStockTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "5",
      },
    ];

    render(<TicketDetails tickets={lowStockTickets} />);

    expect(screen.getByText("5 left")).toBeInTheDocument();
    expect(screen.getByText("Hurry!")).toBeInTheDocument();
  });

  it("should not show low stock warning when quantity is 10 or more", () => {
    const normalStockTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "10",
      },
    ];

    render(<TicketDetails tickets={normalStockTickets} />);

    expect(screen.getByText("10 left")).toBeInTheDocument();
    expect(screen.queryByText("Hurry!")).not.toBeInTheDocument();
  });

  it("should apply low stock styling when quantity is less than 10", () => {
    const lowStockTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "3",
      },
    ];

    render(<TicketDetails tickets={lowStockTickets} />);

    const quantityText = screen.getByText("3 left");
    expect(quantityText).toHaveClass("text-orange-600");
  });

  it("should apply normal stock styling when quantity is 10 or more", () => {
    const normalStockTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "50",
      },
    ];

    render(<TicketDetails tickets={normalStockTickets} />);

    const quantityText = screen.getByText("50 left");
    expect(quantityText).toHaveClass("text-emerald-600");
  });

  it("should not display price for free tickets", () => {
    const freeTickets = [
      {
        id: 1,
        type: "general",
        price: "0.00",
        quantity: "100",
      },
    ];

    render(<TicketDetails tickets={freeTickets} />);

    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
  });

  it("should render multiple tickets correctly", () => {
    const multipleTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "100",
      },
      {
        id: 2,
        type: "vip",
        price: "150.00",
        quantity: "5",
      },
      {
        id: 3,
        type: "student",
        price: "25.00",
        quantity: "0",
      },
    ];

    render(<TicketDetails tickets={multipleTickets} />);

    expect(screen.getByText(/general ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/vip ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/student ticket/i)).toBeInTheDocument();
  });

  it("should handle negative quantity as sold out", () => {
    const negativeQuantityTickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "-5",
      },
    ];

    render(<TicketDetails tickets={negativeQuantityTickets} />);

    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("should format price with two decimal places", () => {
    const tickets = [
      {
        id: 1,
        type: "general",
        price: "50",
        quantity: "100",
      },
    ];

    render(<TicketDetails tickets={tickets} />);

    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("should capitalize ticket type", () => {
    const tickets = [
      {
        id: 1,
        type: "early bird",
        price: "35.00",
        quantity: "20",
      },
    ];

    render(<TicketDetails tickets={tickets} />);

    const ticketText = screen.getByText(/early bird ticket/i);
    expect(ticketText).toBeInTheDocument();
    expect(ticketText).toHaveClass("capitalize");
  });

  it("should render empty list when no tickets provided", () => {
    const { container } = render(<TicketDetails tickets={[]} />);

    expect(container.querySelector(".space-y-3")).toBeInTheDocument();
    expect(container.querySelector(".space-y-3").children).toHaveLength(0);
  });

  it("should show sold out for quantity exactly 0", () => {
    const tickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "0",
      },
    ];

    render(<TicketDetails tickets={tickets} />);

    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("should show low stock for quantity exactly 9", () => {
    const tickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "9",
      },
    ];

    render(<TicketDetails tickets={tickets} />);

    expect(screen.getByText("9 left")).toBeInTheDocument();
    expect(screen.getByText("Hurry!")).toBeInTheDocument();
  });

  it("should not show hurry message for quantity exactly 10", () => {
    const tickets = [
      {
        id: 1,
        type: "general",
        price: "50.00",
        quantity: "10",
      },
    ];

    render(<TicketDetails tickets={tickets} />);

    expect(screen.getByText("10 left")).toBeInTheDocument();
    expect(screen.queryByText("Hurry!")).not.toBeInTheDocument();
  });
});
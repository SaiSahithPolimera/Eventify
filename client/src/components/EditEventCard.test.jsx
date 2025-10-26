import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EditEventCard from "./EditEventCard";

describe("EditEventCard Component", () => {
  const handleEdit = vi.fn();
  const handleDeleteClick = vi.fn();

  const event = {
    id: 1,
    title: "Test Event",
    description: "Test Description",
    date: "2025-12-25",
    time: "18:00",
    location: "Test Location",
  };

  const ticket = {
    type: "paid",
    price: 25.99,
    quantity: 100,
  };

  const stats = {
    total_rsvps: 50,
    total_revenue: 1299.5,
  };

  it("should render event details correctly", () => {
    render(
      <EditEventCard
        event={event}
        ticket={ticket}
        stats={stats}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
      />
    );

    expect(screen.getByText("Test Event")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Dec 25, 2025")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
    expect(screen.getByText("$25.99")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("$1299.50")).toBeInTheDocument();
  });

  it("should call handleEdit when the edit button is clicked", async () => {
    render(
      <EditEventCard
        event={event}
        ticket={ticket}
        stats={stats}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
      />
    );

    await userEvent.click(screen.getByText("Edit"));
    expect(handleEdit).toHaveBeenCalledWith(event);
  });

  it("should call handleDeleteClick when the delete button is clicked", async () => {
    render(
      <EditEventCard
        event={event}
        ticket={ticket}
        stats={stats}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
      />
    );

    await userEvent.click(screen.getByText("Delete"));
    expect(handleDeleteClick).toHaveBeenCalledWith(event.id);
  });
});

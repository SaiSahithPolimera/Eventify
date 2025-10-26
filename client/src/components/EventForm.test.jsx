import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EventForm from "./EventForm";

describe("EventForm Component", () => {
  const setForm = vi.fn();
  const today = new Date().toISOString().split("T")[0];

  const defaultProps = {
    form: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      ticketType: "free",
      ticketPrice: "",
      ticketQuantity: "",
    },
    setForm,
    today,
    errors: {},
  };

  it("should render all form fields", () => {
    render(<EventForm {...defaultProps} />);
    expect(screen.getByLabelText("Event Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Location or URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
  });

  it("should call setForm when a user types in a field", async () => {
    render(<EventForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Event Title"), "New Event");
    expect(setForm).toHaveBeenCalled();
  });

  it("should show the price field when ticket type is paid", () => {
    render(<EventForm {...defaultProps} form={{ ...defaultProps.form, ticketType: "paid" }} />);
    expect(screen.getByLabelText("Price ($)")).toBeInTheDocument();
  });

  it("should not show the price field when ticket type is free", () => {
    render(<EventForm {...defaultProps} />);
    expect(screen.queryByLabelText("Price ($)")).not.toBeInTheDocument();
  });

  it("should display error messages", () => {
    const errors = {
      title: "Title is required",
      description: "Description is required",
      date: "Date is required",
      time: "Time is required",
      location: "Location is required",
      ticketType: "Ticket type is required",
      ticketPrice: "Ticket price is required",
      ticketQuantity: "Ticket quantity is required",
    };
    render(<EventForm {...defaultProps} errors={errors} />);
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(screen.getByText("Time is required")).toBeInTheDocument();
    expect(screen.getByText("Location is required")).toBeInTheDocument();
    expect(screen.getByText("Ticket type is required")).toBeInTheDocument();
    expect(screen.getByText("Ticket quantity is required")).toBeInTheDocument();
  });
});

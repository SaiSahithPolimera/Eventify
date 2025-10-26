import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Filterbar from "./Filterbar";

describe("Filterbar Component", () => {
  const setFilters = vi.fn();

  const defaultProps = {
    filters: { location: "", date: "", price: "all" },
    setFilters,
    filtered: [],
  };

  it("should render all filter inputs", () => {
    render(<Filterbar {...defaultProps} />);
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Price Type")).toBeInTheDocument();
  });

  it("should call setFilters when a user types in the location field", async () => {
    render(<Filterbar {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Location"), "New York");
    expect(setFilters).toHaveBeenCalled();
  });

  it("should call setFilters when a user selects a date", async () => {
    render(<Filterbar {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Date"), "2025-12-25");
    expect(setFilters).toHaveBeenCalled();
  });

  it("should call setFilters when a user selects a price type", async () => {
    render(<Filterbar {...defaultProps} />);
    await userEvent.selectOptions(screen.getByLabelText("Price Type"), "free");
    expect(setFilters).toHaveBeenCalled();
  });

  it("should display the number of filtered events", () => {
    render(<Filterbar {...defaultProps} filtered={[1, 2, 3]} />);
    expect(screen.getByText("3 events found")).toBeInTheDocument();
  });

  it('should show "Clear all filters" button when a filter is active', () => {
    render(<Filterbar {...defaultProps} filters={{ ...defaultProps.filters, location: 'New York' }} />);
    expect(screen.getByText("Clear all filters")).toBeInTheDocument();
  });

  it('should call setFilters with default values when "Clear all filters" is clicked', async () => {
    render(<Filterbar {...defaultProps} filters={{ ...defaultProps.filters, location: 'New York' }} />);
    await userEvent.click(screen.getByText("Clear all filters"));
    expect(setFilters).toHaveBeenCalledWith({ location: "", date: "", price: "all" });
  });
});
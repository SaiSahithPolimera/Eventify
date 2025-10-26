import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RsvpEventCard from "./RsvpEventCard";

vi.mock("./Modal", () => ({
  default: ({ children, show }) => (show ? <div>{children}</div> : null),
}));

describe("RsvpEventCard Component", () => {
  const onCancelRsvp = vi.fn();
  let windowOpenSpy;
  let consoleErrorSpy;

  const mockEvent = {
    rsvp_id: "rsvp123",
    title: "Tech Conference 2025",
    description: "A conference about the future of tech.",
    date: "2025-12-01T10:00:00.000Z",
    time: "10:00",
    location: "123 Tech Lane, Silicon Valley",
    locationType: "physical",
    tickets: [{ price: "50.00" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should render event details correctly", () => {
    render(<RsvpEventCard event={mockEvent} onCancelRsvp={onCancelRsvp} />);
    expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
    expect(screen.getByText("A conference about the future of tech.")).toBeInTheDocument();
    expect(screen.getByText(/Dec 1, 2025/)).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("123 Tech Lane, Silicon Valley")).toBeInTheDocument();
    expect(screen.getByText(/physical/i)).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
    expect(screen.getByText("RSVP Confirmed")).toBeInTheDocument();
  });

  it('should display "Free" for a zero-price ticket', () => {
    const freeEvent = { ...mockEvent, tickets: [{ price: "0" }] };
    render(<RsvpEventCard event={freeEvent} onCancelRsvp={onCancelRsvp} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should handle the cancel RSVP flow correctly", async () => {
    render(<RsvpEventCard event={mockEvent} onCancelRsvp={onCancelRsvp} />);

    const cardCancelButton = screen.getByRole("button", { name: /Cancel RSVP/i });
    await userEvent.click(cardCancelButton);

    expect(screen.getByText("Cancel RSVP?")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Keep RSVP/i }));
    expect(screen.queryByText("Cancel RSVP?")).not.toBeInTheDocument();
    expect(onCancelRsvp).not.toHaveBeenCalled();

    await userEvent.click(cardCancelButton);
    const modal = screen.getByText("Cancel RSVP?").parentElement;
    const confirmButton = within(modal).getByRole("button", { name: "Cancel RSVP" });
    await userEvent.click(confirmButton);

    expect(onCancelRsvp).toHaveBeenCalledTimes(1);
    expect(onCancelRsvp).toHaveBeenCalledWith("rsvp123");
  });

  it('should disable buttons and show "Cancelling..." when isCanceling is true', async () => {
    render(<RsvpEventCard event={mockEvent} onCancelRsvp={onCancelRsvp} isCanceling={true} />);

    const cancellingButtons = screen.getAllByRole("button", { name: /Cancelling.../i });
    cancellingButtons.forEach(button => expect(button).toBeDisabled());
  });

  it('should open a Google Calendar link when "Add to Calendar" is clicked', async () => {
    render(<RsvpEventCard event={mockEvent} onCancelRsvp={onCancelRsvp} />);
    await userEvent.click(screen.getByRole("button", { name: /Add to Calendar/i }));

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    const url = windowOpenSpy.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);

    expect(url).toContain("https://www.google.com/calendar/render");
    expect(params.get('text')).toBe('Tech Conference 2025');
    expect(params.get('details')).toBe('A conference about the future of tech.');
    expect(params.get('location')).toBe('123 Tech Lane, Silicon Valley');
  });

  it("should show an error modal when trying to add an event with an invalid date", async () => {
    const invalidEvent = { ...mockEvent, date: "invalid-date" };
    render(<RsvpEventCard event={invalidEvent} onCancelRsvp={onCancelRsvp} />);

    expect(screen.queryByText("Error")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Add to Calendar/i }));

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText(/Unable to generate calendar link/)).toBeInTheDocument();
  });
});
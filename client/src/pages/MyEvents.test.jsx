import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyEvents from "./MyEvents";

vi.mock("../components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock("../components/Modal", () => ({
  default: ({ show, onClose, title, children }) =>
    show ? (
      <div role="dialog" data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close modal">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../components/EventForm", () => ({
  default: ({ form, setForm, errors }) => (
    <div data-testid="event-form">
      <input
        placeholder="Event Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      {errors.submit && <p>{errors.submit}</p>}
    </div>
  ),
}));

const mockEvents = [
  {
    id: 1,
    title: "Tech Conference 2025",
    description: "Annual tech conference",
    date: "2025-10-20",
    time: "10:00 AM",
    location: "New York",
    tickets: [{ id: 1, type: "paid", price: "50.00", quantity: 100 }],
    stats: { total_rsvps: 25, total_revenue: "1250.00" },
  },
  {
    id: 2,
    title: "Music Festival",
    description: "Summer music festival",
    date: "2025-11-15",
    time: "6:00 PM",
    location: "Los Angeles",
    tickets: [{ id: 2, type: "free", price: "0.00", quantity: 200 }],
    stats: { total_rsvps: 50, total_revenue: "0.00" },
  },
];

const TestWrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("MyEvents", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setupFetchMocks = (events = mockEvents) => {
    fetch.mockImplementation((url) => {
      if (url.includes("/events/my-events")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ events }),
        });
      }
      if (url.includes("/tickets")) {
        const eventId = url.split("/events/")[1].split("/")[0];
        const event = events.find((e) => e.id === parseInt(eventId));
        return Promise.resolve({
          ok: true,
          json: async () => ({ tickets: event?.tickets || [] }),
        });
      }
      if (url.includes("/stats")) {
        const eventId = url.split("/events/")[1].split("/")[0];
        const event = events.find((e) => e.id === parseInt(eventId));
        return Promise.resolve({
          ok: true,
          json: async () => ({ stats: event?.stats || {} }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
    });
  };

  it("should render loading state initially", () => {
    fetch.mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    expect(screen.getByText("Loading your events...")).toBeInTheDocument();
  });

  it("should render events list successfully", async () => {
    setupFetchMocks();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    expect(await screen.findByText("Tech Conference 2025")).toBeInTheDocument();
    expect(screen.getByText("Music Festival")).toBeInTheDocument();
    expect(screen.getByText("My Events")).toBeInTheDocument();
    expect(screen.getByText("Manage all your created events")).toBeInTheDocument();
  });

  it("should display event details including stats", async () => {
    setupFetchMocks();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    await screen.findByText("Tech Conference 2025");

    expect(screen.getByText("Annual tech conference")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("$1250.00")).toBeInTheDocument();
  });

  it("should filter events by search term", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    await screen.findByText("Tech Conference 2025");

    const searchInput = screen.getByPlaceholderText(
      "Search events by title or location..."
    );
    await user.type(searchInput, "Tech");

    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
      expect(screen.queryByText("Music Festival")).not.toBeInTheDocument();
    });
  });

  it("should open create event modal when Create Event button is clicked", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    await screen.findByText("Tech Conference 2025");

    const createButton = screen.getByRole("button", { name: "Create Event" });
    await user.click(createButton);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("Create Event").length).toBeGreaterThan(0);
  });

  it("should open edit modal when Edit button is clicked", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    await screen.findByText("Tech Conference 2025");

    const editButtons = screen.getAllByText("Edit");
    await user.click(editButtons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Event")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tech Conference 2025")).toBeInTheDocument();
  });

  it("should open delete confirmation modal when Delete button is clicked", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    await screen.findByText("Tech Conference 2025");

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Event?")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure? This action cannot be undone.")
    ).toBeInTheDocument();
  });

  it("should display error message when fetching events fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch events"));

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    expect(await screen.findByText("Failed to fetch events")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should show 'No Events' message when no events exist", async () => {
    setupFetchMocks([]);

    render(
      <TestWrapper>
        <MyEvents />
      </TestWrapper>
    );

    expect(await screen.findByText("No Events")).toBeInTheDocument();
    expect(
      screen.getByText("You haven't created any events yet")
    ).toBeInTheDocument();
  });
});

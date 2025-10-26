import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

vi.mock("../components/Navbar", () => ({
    default: () => <nav>Navbar</nav>,
}));

vi.mock("../components/Filterbar", () => ({
    default: ({ filters, setFilters, filtered }) => (
        <div data-testid="filterbar">
            <input
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
            <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
            <select
                value={filters.price}
                onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
            </select>
            <span>Filtered: {filtered.length}</span>
        </div>
    ),
}));

vi.mock("../components/BrowseEventsTab", () => ({
    default: ({ filtered, userRsvps, setSelectedEvent }) => (
        <div data-testid="browse-events-tab">
            {filtered.length === 0 ? (
                <p>No Events</p>
            ) : (
                filtered.map((event) => (
                    <div key={event.id} data-testid={`event-${event.id}`}>
                        <h3>{event.title}</h3>
                        <button onClick={() => setSelectedEvent(event)}>View Details</button>
                        {userRsvps.has(event.id) && <span>RSVP'd</span>}
                    </div>
                ))
            )}
        </div>
    ),
}));

vi.mock("../components/MyRsvpTab", () => ({
    default: ({ rsvpdEvents, loadingRsvpdEvents, onCancelRsvp, cancelingRsvp }) => (
        <div data-testid="my-rsvp-tab">
            {loadingRsvpdEvents ? (
                <p>Loading RSVPs...</p>
            ) : rsvpdEvents.length === 0 ? (
                <p>No RSVP'd events</p>
            ) : (
                rsvpdEvents.map((event) => (
                    <div key={event.id} data-testid={`rsvp-event-${event.id}`}>
                        <h3>{event.title}</h3>
                        <button
                            onClick={() => onCancelRsvp(event.rsvp_id)}
                            disabled={cancelingRsvp === event.rsvp_id}
                        >
                            {cancelingRsvp === event.rsvp_id ? "Canceling..." : "Cancel RSVP"}
                        </button>
                    </div>
                ))
            )}
        </div>
    ),
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

const mockEvents = [
    {
        id: 1,
        title: "Tech Conference 2025",
        description: "Annual tech conference",
        date: "2025-10-20T10:00:00Z",
        time: "10:00 AM",
        location: "New York",
        tickets: [{ id: 1, type: "paid", price: "50.00", quantity: 100 }],
    },
    {
        id: 2,
        title: "Music Festival",
        description: "Summer music festival",
        date: "2025-11-15T18:00:00Z",
        time: "6:00 PM",
        location: "Los Angeles",
        tickets: [{ id: 2, type: "free", price: "0.00", quantity: 200 }],
    },
];

const mockRsvps = [
    { id: 101, event_id: 1, ticket_id: 1, status: "confirmed" },
];

const TestWrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("Dashboard", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const setupFetchMocks = (events = mockEvents, rsvps = mockRsvps) => {
        fetch.mockImplementation((url) => {
            if (url.includes("/events") && !url.includes("/tickets")) {
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
            if (url.includes("/rsvps/my")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ rsvps }),
                });
            }
            if (url.includes("/rsvps") && url.split("/").length === 5) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ message: "RSVP successful" }),
                });
            }
            return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });
    };

    it("should render dashboard and load events successfully", async () => {
        setupFetchMocks();

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        expect(screen.getByText("Loading events...")).toBeInTheDocument();

        expect(await screen.findByText("Tech Conference 2025")).toBeInTheDocument();
        expect(screen.getByText("Music Festival")).toBeInTheDocument();

        expect(screen.getByText("Browse Events")).toBeInTheDocument();
        expect(screen.getByText(/My RSVP'd Events/)).toBeInTheDocument();
    });

    it("should display error message when fetching events fails", async () => {
        fetch.mockRejectedValueOnce(new Error("Failed to load events"));

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        expect(await screen.findByText("Failed to load events")).toBeInTheDocument();
        expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should filter events by location", async () => {
        setupFetchMocks();
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        await screen.findByText("Tech Conference 2025");

        const locationInput = screen.getByPlaceholderText("Search location...");
        await user.type(locationInput, "New York");

        await waitFor(() => {
            expect(screen.getByText("Tech Conference 2025")).toBeInTheDocument();
            expect(screen.queryByText("Music Festival")).not.toBeInTheDocument();
        });
    });

    it("should filter events by price", async () => {
        setupFetchMocks();
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        await screen.findByText("Tech Conference 2025");

        const priceSelect = screen.getByDisplayValue("All Prices");
        await user.selectOptions(priceSelect, "free");

        await waitFor(() => {
            expect(screen.queryByText("Tech Conference 2025")).not.toBeInTheDocument();
            expect(screen.getByText("Music Festival")).toBeInTheDocument();
        });
    });

    it("should open event modal when View Details is clicked", async () => {
        setupFetchMocks();
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        await screen.findByText("Tech Conference 2025");

        const viewButtons = screen.getAllByText("View Details");
        await user.click(viewButtons[0]);

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
        expect(screen.getAllByText("Tech Conference 2025").length).toBeGreaterThan(0);
        expect(screen.getByText("Annual tech conference")).toBeInTheDocument();
    });

    it("should successfully RSVP to an event", async () => {
        setupFetchMocks(mockEvents, []);
        const user = userEvent.setup();

        fetch.mockImplementation((url, options) => {
            if (url.includes("/events") && !url.includes("/tickets")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ events: mockEvents }),
                });
            }
            if (url.includes("/tickets")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ tickets: mockEvents[0].tickets }),
                });
            }
            if (url.includes("/rsvps/my")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ rsvps: [] }),
                });
            }
            if (options?.method === "POST" && url.includes("/rsvps")) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ message: "RSVP confirmed!" }),
                });
            }
            return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        await screen.findByText("Tech Conference 2025");

        const viewButtons = screen.getAllByText("View Details");
        await user.click(viewButtons[0]);

        const rsvpButton = await screen.findByText("RSVP Now");
        await user.click(rsvpButton);

        expect(await screen.findByText("Success!")).toBeInTheDocument();
        expect(screen.getByText("RSVP confirmed!")).toBeInTheDocument();
    });

    it("should switch to My RSVP'd Events tab and display RSVP'd events", async () => {
        setupFetchMocks();
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <Dashboard />
            </TestWrapper>
        );

        await screen.findByText("Tech Conference 2025");

        const myRsvpsTab = screen.getByText(/My RSVP'd Events/);
        await user.click(myRsvpsTab);

        expect(await screen.findByTestId("my-rsvp-tab")).toBeInTheDocument();
    });
});
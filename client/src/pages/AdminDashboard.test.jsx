import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

vi.mock("../components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock("../components/Icons", () => ({
  ChevronDown: () => <span>ChevronDown</span>,
  Download: () => <span>Download</span>,
  FileText: () => <span>FileText</span>,
}));

const mockPdfSave = vi.fn();
const mockPdfText = vi.fn();
vi.mock("jspdf", () => ({
  default: vi.fn(function () {
    this.text = mockPdfText;
    this.save = mockPdfSave;
  }),
}));

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

const mockEvents = [
  { id: "1", title: "Tech Conference 2025", date: "2025-10-20T10:00:00Z" },
  { id: "2", title: "Music Festival", date: "2025-11-15T18:00:00Z" },
];

const mockEventDetails = {
  id: "1",
  title: "Tech Conference 2025",
  description: "An annual conference for tech enthusiasts.",
  date: "2025-10-20T10:00:00Z",
  time: "10:00 AM",
  location: "Convention Center",
};

const mockStats = {
  total_rsvps: 2,
  total_revenue: "150.00",
};

const mockRsvps = [
  { id: 101, user_id: 1, status: "confirmed", ticket_type: "vip", created_at: "2025-01-10T10:00:00Z" },
  { id: 102, user_id: 2, status: "cancelled", ticket_type: "general", created_at: "2025-01-12T10:00:00Z" },
];

const mockUsers = {
  "1": { name: "Alice Johnson", email: "alice@example.com", role: "attendee" },
  "2": { name: "Bob Williams", email: "bob@example.com", role: "attendee" },
};

const TestWrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const setupFetchMocks = (
    events = mockEvents,
    eventDetails = mockEventDetails,
    stats = mockStats,
    rsvps = mockRsvps,
    users = mockUsers
  ) => {
    fetch.mockImplementation((url) => {
      if (url.includes("/events/my-events")) {
        return Promise.resolve({ ok: true, json: async () => ({ events }) });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({ ok: true, json: async () => ({ stats }) });
      }
      if (url.includes("/rsvps/event/")) {
        return Promise.resolve({ ok: true, json: async () => ({ rsvps }) });
      }
      if (url.includes("/users/")) {
        const userId = url.split("/users/")[1].split("/")[0];
        return Promise.resolve({ ok: true, json: async () => ({ userData: users[userId] }) });
      }
      if (url.includes("/events/") && !url.includes("/stats") && !url.includes("/my-events")) {
        return Promise.resolve({ ok: true, json: async () => ({ event: eventDetails }) });
      }
      return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
    });
  };

  it("should render dashboard and load events successfully", async () => {
    setupFetchMocks();

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Track RSVPs, manage attendees.")).toBeInTheDocument();

    await screen.findByText("Select Event");
    expect(screen.getByText("Tech Conference 2025 - Oct 20")).toBeInTheDocument();
    expect(screen.getByText("Music Festival - Nov 15")).toBeInTheDocument();
  });

  it("should display event details, stats, and attendees when event is selected", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await screen.findByText("Select Event");
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    expect(await screen.findByText("Tech Conference 2025")).toBeInTheDocument();
    expect(screen.getByText("An annual conference for tech enthusiasts.")).toBeInTheDocument();

    expect(screen.getByText("Total Attendees")).toBeInTheDocument();
    const attendeeCount = screen.getAllByText("2");
    expect(attendeeCount.length).toBeGreaterThan(0);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Williams")).toBeInTheDocument();
    expect(screen.getByText("✓ Confirmed")).toBeInTheDocument();
    expect(screen.getByText("✗ Cancelled")).toBeInTheDocument();
  });

  it("should filter attendees by search term", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await screen.findByText("Select Event");
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    await screen.findByText("Alice Johnson");

    const searchInput = screen.getByPlaceholderText(/Name or email/i);
    await user.type(searchInput, "Alice");

    await waitFor(() => {
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.queryByText("Bob Williams")).not.toBeInTheDocument();
    });
  });

  it("should disable export buttons when no attendees match filters", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await screen.findByText("Select Event");
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    await screen.findByText("Alice Johnson");

    const searchInput = screen.getByPlaceholderText(/Name or email/i);
    await user.type(searchInput, "NonExistentName");

    await waitFor(() => {
      expect(screen.getByText(/No attendees found/)).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    const exportCsvButton = buttons.find(btn =>
      btn.textContent.includes("CSV") || btn.textContent.includes("Export CSV")
    );
    const exportPdfButton = buttons.find(btn =>
      btn.textContent.includes("PDF") || btn.textContent.includes("Export PDF")
    );

    expect(exportCsvButton).toBeDisabled();
    expect(exportPdfButton).toBeDisabled();
  });

  it("should display error message when fetching events fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch your events. Please ensure you are logged in as an organizer."));

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    expect(await screen.findByText("Failed to fetch your events. Please ensure you are logged in as an organizer.")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should export attendees to PDF when export button is clicked", async () => {
    setupFetchMocks();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    );

    await screen.findByText("Select Event");
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "1");

    await screen.findByText("Alice Johnson");

    const buttons = screen.getAllByRole("button");
    const exportPdfButton = buttons.find(btn =>
      btn.textContent.includes("PDF") || btn.textContent.includes("Export PDF")
    );

    await user.click(exportPdfButton);

    expect(mockPdfText).toHaveBeenCalledWith("Tech Conference 2025", 14, 15);
    expect(mockPdfSave).toHaveBeenCalledWith("Tech Conference 2025.pdf");
  });
});
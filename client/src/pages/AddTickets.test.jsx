import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AddTickets from "./AddTickets";

vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useAuth: vi.fn(),
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/events/1/tickets']}>
    <Routes>
      <Route path="/events/:id/tickets" element={children} />
    </Routes>
  </MemoryRouter>
);

describe("AddTickets Page", () => {
  const mockOrganizer = { id: 1, role: 'organizer' };
  const mockEvent = { id: 1, title: 'My Awesome Event', organizer_id: 1 };
  const mockTickets = [{ id: 1, type: 'free', price: 0, quantity: 100 }];

  beforeEach(() => {
    vi.spyOn(window, 'fetch');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useAuth.mockReturnValue({ user: mockOrganizer });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should show a loading state initially", () => {
    fetch.mockImplementation(() => new Promise(() => { }));
    render(<TestWrapper><AddTickets /></TestWrapper>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should display an authorization error if user is not the event organizer", async () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'organizer' } });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: [] }),
    });

    render(<TestWrapper><AddTickets /></TestWrapper>);

    expect(await screen.findByText(/You are not authorized to manage tickets for this event/)).toBeInTheDocument();
  });

  it("should fetch and display existing tickets", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: mockTickets }),
    });

    render(<TestWrapper><AddTickets /></TestWrapper>);

    expect(await screen.findByText(/Free Ticket/i)).toBeInTheDocument();
    expect(screen.getByText(/100 available/i)).toBeInTheDocument();
  });

  it("should allow an organizer to add a new paid ticket", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: [] }),
    });

    render(<TestWrapper><AddTickets /></TestWrapper>);

    const addTicketButton = await screen.findByRole('button', { name: /Add Ticket Type/i });
    await user.click(addTicketButton);

    await user.click(screen.getByText(/Paid/i));
    await user.type(screen.getByLabelText(/Ticket Price/i), '25');
    await user.type(screen.getByLabelText(/Available Quantity/i), '50');

    const newTicket = { id: 2, type: 'paid', price: 25, quantity: 50 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, ticket: newTicket }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: [newTicket] }),
    });

    await user.click(screen.getByRole('button', { name: 'Add Ticket Type' }));

    expect(await screen.findByText(/Paid Ticket/i)).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it("should allow an organizer to delete a ticket", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: mockTickets }),
    });

    render(<TestWrapper><AddTickets /></TestWrapper>);

    const deleteButton = await screen.findByTitle(/Delete ticket type/i);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: [] }),
    });

    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText(/No Tickets Added Yet/i)).toBeInTheDocument();
  });

  it("should navigate to dashboard on finish", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, event: mockEvent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tickets: mockTickets }),
    });

    render(<TestWrapper><AddTickets /></TestWrapper>);

    const finishButton = await screen.findByRole('button', { name: /Finish & View Event/i });
    await user.click(finishButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
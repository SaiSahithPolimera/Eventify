import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Signup from "./Signup";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../components/Icons", () => ({
  AttendeeIcon: () => <span>AttendeeIcon</span>,
  OrganizerIcon: () => <span>OrganizerIcon</span>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      signup: vi.fn(),
      isAuthenticated: false,
    });
  });

  it("should render signup form with all fields", () => {
    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    expect(screen.getByText("Join Eventify today")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText("Attendee")).toBeInTheDocument();
    expect(screen.getByText("Organizer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
  });

  it("should show validation error for name too short", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText("Full Name");
    await user.type(nameInput, "John");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Name must be at least 6 characters")).toBeInTheDocument();
  });

  it("should show validation error for password too short", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "pass");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("should show validation error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password456");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("should allow selecting attendee role", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const attendeeButton = screen.getByRole("button", { name: /Attendee/i });
    await user.click(attendeeButton);

    expect(attendeeButton).toHaveClass("border-rose-500");
  });

  it("should allow selecting organizer role", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const organizerButton = screen.getByRole("button", { name: /Organizer/i });
    await user.click(organizerButton);

    expect(organizerButton).toHaveClass("border-pink-500");
  });

  it("should successfully signup with valid data", async () => {
    const mockSignup = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({
      signup: mockSignup,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "attendee",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: { message: "Account created! Please login." },
      });
    });
  });

  it("should successfully signup as organizer", async () => {
    const mockSignup = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({
      signup: mockSignup,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const organizerButton = screen.getByRole("button", { name: /Organizer/i });

    await user.type(nameInput, "Jane Smith");
    await user.type(emailInput, "jane@example.com");
    await user.click(organizerButton);
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "organizer",
      });
    });
  });

  it("should display error message on signup failure", async () => {
    const mockSignup = vi.fn().mockResolvedValue({
      success: false,
      errors: [{ fieldName: "email", message: "Email already exists" }],
    });
    useAuth.mockReturnValue({
      signup: mockSignup,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });

  it("should redirect to dashboard if already authenticated", () => {
    useAuth.mockReturnValue({
      signup: vi.fn(),
      isAuthenticated: true,
    });

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    expect(screen.queryByText("Join Eventify today")).not.toBeInTheDocument();
  });

  it("should clear field error when user starts typing", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Signup />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /Create Account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Full Name");
    await user.type(nameInput, "J");

    await waitFor(() => {
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });
});

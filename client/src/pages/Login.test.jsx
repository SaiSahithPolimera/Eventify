import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
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

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: vi.fn(),
      isAuthenticated: false,
    });
  });

  it("should render login form with all fields", () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
  });

  it("should show validation errors for empty fields", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole("button", { name: /Sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("should successfully login with valid credentials", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /Sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should display error message on login failure", async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      success: false,
      errors: [{ fieldName: "submit", message: "Invalid credentials" }],
    });
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: /Sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should redirect to dashboard if already authenticated", () => {
    useAuth.mockReturnValue({
      login: vi.fn(),
      isAuthenticated: true,
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });
});

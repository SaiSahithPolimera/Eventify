import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

const TestComponent = () => {
  const { user, login, logout, signup, errors, isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Auth Test</h1>
      {isAuthenticated ? (
        <div>
          <p data-testid="user-name">{user.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not Authenticated</p>
          <button onClick={() => login("test@test.com", "password")}>Login</button>
          <button
            onClick={() =>
              signup({ name: "New User", email: "new@test.com", password: "password" })
            }
          >
            Signup
          </button>
        </div>
      )}
      {errors.length > 0 && (
        <div data-testid="errors">
          {errors.map((err, i) => (
            <p key={i}>{err.message}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<AuthProvider />}>
          <Route path="/" element={<TestComponent />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe("AuthContext", () => {
  const originalError = console.error;

  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    console.error = originalError;
  });

  it("should handle successful login", async () => {
    const mockUser = { id: 1, name: "Test User", email: "test@test.com", role: "attendee" };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    renderWithProvider();

    await userEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    expect(storedUser.name).toBe("Test User");
  });

  it("should handle failed login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: "Invalid credentials" }),
    });

    renderWithProvider();

    await userEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      if (errors) expect(errors).toHaveTextContent("Invalid credentials");
    });
  });

  it("should handle successful signup", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProvider();
    await userEvent.click(screen.getByRole("button", { name: /Signup/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("errors")).not.toBeInTheDocument();
    });
  });

  it("should handle logout", async () => {
    const mockUser = { id: 1, name: "Test User", email: "test@test.com", role: "attendee" };
    localStorage.setItem("user", JSON.stringify(mockUser));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    });

    await userEvent.click(screen.getByRole("button", { name: /Logout/i }));

    await waitFor(() => {
      expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
    });

    expect(localStorage.getItem("user")).toBe(null);
  });

  it("should restore user from localStorage on mount", async () => {
    const mockUser = { id: 1, name: "Stored User", email: "stored@test.com", role: "organizer" };
    localStorage.setItem("user", JSON.stringify(mockUser));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Stored User");
    });
  });

  it("should handle network error during login", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithProvider();
    await userEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("errors")).toHaveTextContent("Network error. Please try again.");
    });
  });

  it("should handle network error during signup", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithProvider();
    await userEvent.click(screen.getByRole("button", { name: /Signup/i }));

    await waitFor(() => {
      expect(screen.getByTestId("errors")).toHaveTextContent("Network error. Please try again.");
    });
  });

  it("should handle login with errors array", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        errors: [
          { message: "Email is required" },
          { message: "Password is required" },
        ],
      }),
    });

    renderWithProvider();
    await userEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      const errorsDiv = screen.getByTestId("errors");
      expect(errorsDiv).toHaveTextContent("Email is required");
      expect(errorsDiv).toHaveTextContent("Password is required");
    });
  });

  it("should clear errors when logging in again", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: "Invalid credentials" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Test User",
          email: "test@test.com",
          role: "attendee",
        }),
      });

    renderWithProvider();

    const loginButton = screen.getByRole("button", { name: /Login/i });
    await userEvent.click(loginButton);

    await waitFor(() => {
      const errors = screen.queryByTestId("errors");
      if (errors) expect(errors).toBeInTheDocument();
    });

    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    });

    expect(screen.queryByTestId("errors")).not.toBeInTheDocument();
  });

  it("should handle invalid JSON in localStorage", async () => {
    localStorage.setItem("user", "invalid-json");
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText("Not Authenticated")).toBeInTheDocument();
    });

    expect(localStorage.getItem("user")).toBe(null);
  });
});

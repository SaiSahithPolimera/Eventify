import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext");

const renderComponent = (ui, { initialEntries = ["/"] } = {}) => {
    const protectedPath = initialEntries[0];

    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path={protectedPath} element={ui} />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe("RequireAuth Component", () => {
    it("should render a loading indicator when auth state is loading", () => {
        useAuth.mockReturnValue({ loading: true, user: null });
        renderComponent(
            <RequireAuth>
                <div>Protected Content</div>
            </RequireAuth>
        );
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should navigate to the login page if the user is not authenticated", () => {
        useAuth.mockReturnValue({ loading: false, user: null });
        renderComponent(
            <RequireAuth>
                <div>Protected Content</div>
            </RequireAuth>,
            { initialEntries: ["/protected-route"] }
        );
        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render children if the user is authenticated and no roles are required", () => {
        useAuth.mockReturnValue({ loading: false, user: { name: "Test", role: "attendee" } });
        renderComponent(
            <RequireAuth>
                <div>Protected Content</div>
            </RequireAuth>
        );
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should render children if the user has an allowed role", () => {
        useAuth.mockReturnValue({ loading: false, user: { name: "Admin", role: "organizer" } });
        renderComponent(
            <RequireAuth allowedRoles={["organizer"]}>
                <div>Admin Content</div>
            </RequireAuth>
        );
        expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });

    it("should show Access Denied if the user does not have an allowed role", () => {
        useAuth.mockReturnValue({ loading: false, user: { name: "Test", role: "attendee" } });
        renderComponent(
            <RequireAuth allowedRoles={["organizer"]}>
                <div>Admin Content</div>
            </RequireAuth>
        );
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
        expect(screen.getByText("attendee")).toBeInTheDocument();
        expect(screen.getByText("organizer")).toBeInTheDocument();
        expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../contexts/AuthContext');

const mockLogout = vi.fn();

const renderNavbar = () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('for a logged-in attendee', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { name: 'Jane Doe', role: 'attendee' },
        logout: mockLogout,
      });
    });

    it('should display the user\'s name and initials', () => {
      renderNavbar();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show attendee-specific links in the dropdown', async () => {
      renderNavbar();
      await userEvent.click(screen.getByTitle('Jane Doe'));

      expect(screen.getByText('Browse Events')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('My Events')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('for a logged-in organizer', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: { name: 'Admin User', role: 'organizer' },
        logout: mockLogout,
      });
    });

    it('should display the organizer\'s name and initials', () => {
      renderNavbar();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('AU')).toBeInTheDocument();
    });

    it('should show all navigation links in the dropdown', async () => {
      renderNavbar();
      await userEvent.click(screen.getByTitle('Admin User'));

      expect(screen.getByText('Browse Events')).toBeInTheDocument();
      expect(screen.getByText('My Events')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('for a logged-out user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
      });
    });

    it('should display default "User" text and "U" initial', () => {
      renderNavbar();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  it('should call the logout function when the logout button is clicked', async () => {
    useAuth.mockReturnValue({
      user: { name: 'Test User', role: 'attendee' },
      logout: mockLogout,
    });
    renderNavbar();

    await userEvent.click(screen.getByTitle('Test User'));
    await userEvent.click(screen.getByText('Logout'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
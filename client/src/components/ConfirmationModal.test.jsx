import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ConfirmationModal from "./ConfirmationModal";

describe("ConfirmationModal Component", () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  const defaultProps = {
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    onConfirm,
    onCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should call onConfirm when the confirm button is clicked", async () => {
    render(<ConfirmationModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when the cancel button is clicked", async () => {
    render(<ConfirmationModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should show a spinner when isLoading is true", () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should have a red confirm button when isDangerous is true", () => {
    render(<ConfirmationModal {...defaultProps} isDangerous={true} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass("bg-red-600");
  });
});
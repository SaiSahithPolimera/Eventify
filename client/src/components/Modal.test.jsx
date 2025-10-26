import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Modal from "./Modal";

describe("Modal Component", () => {
  it("should not render when show is false", () => {
    render(<Modal show={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render when show is true", () => {
    render(
      <Modal show={true} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("should call onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal show={true} onClose={onClose} title="Test Modal">
        <p>Modal Content</p>
      </Modal>
    );
    await userEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
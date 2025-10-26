import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { useState } from "react";
import TicketFormSection from "./TicketFormSection";

const TestWrapper = ({ initialForm }) => {
    const [form, setForm] = useState(initialForm);
    return <TicketFormSection form={form} setForm={setForm} />;
};

describe("TicketFormSection Component", () => {
    const defaultForm = {
        ticketType: "free",
        ticketPrice: "",
        ticketQuantity: "",
    };

    it("should render all default fields correctly", () => {
        render(<TestWrapper initialForm={defaultForm} />);
        expect(screen.getByLabelText(/Ticket Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Total Tickets/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Price/i)).not.toBeInTheDocument();
    });

    it("should show the price field when ticket type is changed to 'paid'", async () => {
        render(<TestWrapper initialForm={defaultForm} />);
        const typeSelect = screen.getByLabelText(/Ticket Type/i);
        await userEvent.selectOptions(typeSelect, "paid");
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    });

    it("should hide the price field when ticket type is changed back to 'free'", async () => {
        const paidForm = { ...defaultForm, ticketType: "paid" };
        render(<TestWrapper initialForm={paidForm} />);
        expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
        const typeSelect = screen.getByLabelText(/Ticket Type/i);
        await userEvent.selectOptions(typeSelect, "free");
        expect(screen.queryByLabelText(/Price/i)).not.toBeInTheDocument();
    });

    it("should update form state when user types in the fields", async () => {
        render(<TestWrapper initialForm={defaultForm} />);
        
        await userEvent.selectOptions(screen.getByLabelText(/Ticket Type/i), "paid");
        
        const priceInput = screen.getByLabelText(/Price/i);
        await userEvent.type(priceInput, "25.50");
        expect(priceInput).toHaveValue(25.5);

        const quantityInput = screen.getByLabelText(/Total Tickets/i);
        await userEvent.type(quantityInput, "150");
        expect(quantityInput).toHaveValue(150);
    });


    it("should have required attributes on mandatory fields", () => {
        render(<TestWrapper initialForm={{ ...defaultForm, ticketType: "paid" }} />);
        expect(screen.getByLabelText(/Ticket Type/i)).toBeRequired();
        expect(screen.getByLabelText(/Total Tickets/i)).toBeRequired();
        expect(screen.getByLabelText(/Price/i)).toBeRequired();
    });
});
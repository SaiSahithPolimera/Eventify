import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EventFormSection from "./EventFormSection";

describe("EventFormSection Component", () => {
    const setForm = vi.fn();
    const today = "2025-10-26";
    const defaultForm = {
        title: "",
        date: "",
        time: "",
        locationType: "physical",
        location: "",
        description: "",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render all form fields", () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        expect(screen.getByLabelText(/Event Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Location Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Venue Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    it("should call setForm when the user types in the title field", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const titleInput = screen.getByLabelText(/Event Title/i);
        await userEvent.type(titleInput, "My Awesome Event");

        expect(setForm).toHaveBeenCalled();
    });

    it("should change the location label when location type is changed to 'virtual'", async () => {
        const { rerender } = render(
            <EventFormSection
                form={{ ...defaultForm, locationType: "physical" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(screen.getByLabelText(/Venue Address/i)).toBeInTheDocument();

        const locationTypeSelect = screen.getByLabelText(/Location Type/i);
        await userEvent.selectOptions(locationTypeSelect, "virtual");

        rerender(
            <EventFormSection
                form={{ ...defaultForm, locationType: "virtual" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(screen.getByLabelText(/Meeting Link/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Venue Address/i)).not.toBeInTheDocument();
    });

    it("should update form state for title field", async () => {
        const { rerender } = render(
            <EventFormSection form={defaultForm} setForm={setForm} today={today} />
        );

        const titleInput = screen.getByLabelText(/Event Title/i);
        await userEvent.type(titleInput, "T");

        rerender(
            <EventFormSection
                form={{ ...defaultForm, title: "T" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(titleInput).toHaveValue("T");
    });

    it("should update form state for date field", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const dateInput = screen.getByLabelText(/Date/i);
        await userEvent.type(dateInput, "2025-12-01");

        expect(setForm).toHaveBeenLastCalledWith({ ...defaultForm, date: "2025-12-01" });
    });

    it("should update form state for time field", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const timeInput = screen.getByLabelText(/Time/i);
        await userEvent.type(timeInput, "10:00");

        expect(setForm).toHaveBeenLastCalledWith({ ...defaultForm, time: "10:00" });
    });

    it("should update form state for location type field", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const locationTypeSelect = screen.getByLabelText(/Location Type/i);
        await userEvent.selectOptions(locationTypeSelect, "virtual");

        expect(setForm).toHaveBeenCalledWith({ ...defaultForm, locationType: "virtual" });
    });

    it("should update form state for location field", async () => {
        const { rerender } = render(
            <EventFormSection form={defaultForm} setForm={setForm} today={today} />
        );

        const locationInput = screen.getByLabelText(/Venue Address/i);
        await userEvent.type(locationInput, "1");

        rerender(
            <EventFormSection
                form={{ ...defaultForm, location: "1" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(locationInput).toHaveValue("1");
    });

    it("should update form state for description field", async () => {
        const { rerender } = render(
            <EventFormSection form={defaultForm} setForm={setForm} today={today} />
        );

        const descriptionInput = screen.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, "G");

        rerender(
            <EventFormSection
                form={{ ...defaultForm, description: "G" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(descriptionInput).toHaveValue("G");
    });

    it("should have required attributes on mandatory fields", () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        expect(screen.getByLabelText(/Event Title/i)).toBeRequired();
        expect(screen.getByLabelText(/Date/i)).toBeRequired();
        expect(screen.getByLabelText(/Time/i)).toBeRequired();
        expect(screen.getByLabelText(/Venue Address/i)).toBeRequired();
    });

    it("should set minimum date attribute correctly", () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const dateInput = screen.getByLabelText(/Date/i);
        expect(dateInput).toHaveAttribute("min", today);
    });

    it("should display correct placeholder for physical location", () => {
        render(
            <EventFormSection
                form={{ ...defaultForm, locationType: "physical" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(screen.getByPlaceholderText("123 Main St, City, State")).toBeInTheDocument();
    });

    it("should display correct placeholder for virtual location", () => {
        render(
            <EventFormSection
                form={{ ...defaultForm, locationType: "virtual" }}
                setForm={setForm}
                today={today}
            />
        );

        expect(screen.getByPlaceholderText("https://meet.google.com/...")).toBeInTheDocument();
    });

    it("should render with pre-filled values", () => {
        const filledForm = {
            title: "Existing Event",
            date: "2025-12-01",
            time: "14:30",
            locationType: "virtual",
            location: "https://meet.google.com/abc",
            description: "An existing event description",
        };

        render(<EventFormSection form={filledForm} setForm={setForm} today={today} />);

        expect(screen.getByLabelText(/Event Title/i)).toHaveValue("Existing Event");
        expect(screen.getByLabelText(/Date/i)).toHaveValue("2025-12-01");
        expect(screen.getByLabelText(/Time/i)).toHaveValue("14:30");
        expect(screen.getByLabelText(/Location Type/i)).toHaveValue("virtual");
        expect(screen.getByLabelText(/Meeting Link/i)).toHaveValue("https://meet.google.com/abc");
        expect(screen.getByLabelText(/Description/i)).toHaveValue("An existing event description");
    });

    it("should call setForm with correct values when typing in title", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const titleInput = screen.getByLabelText(/Event Title/i);
        await userEvent.type(titleInput, "A");

        expect(setForm).toHaveBeenCalledWith({ ...defaultForm, title: "A" });
    });

    it("should call setForm with correct values when typing in location", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const locationInput = screen.getByLabelText(/Venue Address/i);
        await userEvent.type(locationInput, "X");

        expect(setForm).toHaveBeenCalledWith({ ...defaultForm, location: "X" });
    });

    it("should call setForm with correct values when typing in description", async () => {
        render(<EventFormSection form={defaultForm} setForm={setForm} today={today} />);

        const descriptionInput = screen.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, "D");

        expect(setForm).toHaveBeenCalledWith({ ...defaultForm, description: "D" });
    });
});
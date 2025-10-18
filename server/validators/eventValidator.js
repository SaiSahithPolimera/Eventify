import { body } from "express-validator";

const nullError = "cannot be empty";

const eventValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage(`Title ${nullError}`)
        .isLength({ min: 5, max: 200 })
        .withMessage(`Title must be between 5 and 200 characters`),
    body("description")
        .trim()
        .notEmpty()
        .withMessage(`Description ${nullError}`)
        .isLength({ min: 10, max: 1000 })
        .withMessage(`Description must be between 10 and 1000 characters`),
    body("date")
        .notEmpty()
        .withMessage(`Date ${nullError}`)
        .isISO8601()
        .withMessage("Date must be a valid date")
        .custom((value) => {
            const eventDate = new Date(value);
            const currentDate = new Date();
            if (isNaN(eventDate.getTime()) || eventDate <= currentDate) {
                throw new Error("Date must be a valid future date");
            }
            return true;
        }),
    body("location")
        .trim()
        .notEmpty()
        .withMessage(`Location ${nullError}`)
];

export default eventValidator;
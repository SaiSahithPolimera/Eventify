import { body } from "express-validator";

const nullError = "cannot be empty";

const ticketValidator = [
    body("type")
        .trim()
        .notEmpty()
        .withMessage(`Type ${nullError}`)
        .isIn(['free', 'paid'])
        .withMessage("Type must be 'free' or 'paid'"),
    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be 0 or greater")
        .custom((value, { req }) => {
            const price = parseFloat(value);
            if (req.body.type === 'free' && price !== 0) {
                throw new Error("Free tickets must have price = 0");
            }
            if (req.body.type === 'paid' && price <= 0) {
                throw new Error("Paid tickets must have price > 0");
            }
            return true;
        }),
    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("event_id")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("Event must have a valid ID")
];

export default ticketValidator;
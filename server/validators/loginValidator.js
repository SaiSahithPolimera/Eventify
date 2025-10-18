import { body } from "express-validator";

const nullError = "cannot be empty";
const passwordError = "must contain minimum 8 characters";
const nameError = "must contain minimum 6 characters";

const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage(`Email ${nullError}`)
        .isLength({ max: 100 })
        .withMessage(`Email ${nameError}`)
        .isEmail()
        .withMessage("Email must be a valid address")
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage("Email must be less than 100 characters"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage(`Password ${nullError}`)
        .isLength({ min: 8 })
        .withMessage(`Password ${passwordError}`),
];

export default loginValidator;
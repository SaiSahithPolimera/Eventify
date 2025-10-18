import { body } from "express-validator";

const nullError = "cannot be empty";
const passwordError = "must contain minimum 8 characters";
const nameError = "must contain minimum 6 characters";

const signUpValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage(`Name ${nullError}`)
        .isLength({ min: 6, max: 100 })
        .withMessage(`Name ${nameError}`),
    body("email")
        .trim()
        .notEmpty()
        .withMessage(`Email ${nullError}`)
        .normalizeEmail()
        .isLength({ max: 100 })
        .isEmail()
        .withMessage("Email must be a valid address"),
    body("password")
        .notEmpty()
        .withMessage(`Password ${nullError}`)
        .isLength({ min: 8, max: 128 })
        .withMessage(`Password ${passwordError}`),
    body("role")
        .notEmpty()
        .withMessage(`Role ${nullError}`)
        .isIn(["organizer", "attendee"])
        .withMessage("Role must be either 'organizer' or 'attendee'"),
    body("confirmPassword")
        .notEmpty()
        .withMessage(`Confirm password ${nullError}`)
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords must match!");
            }
            return true;
        }),
];

export default signUpValidator;
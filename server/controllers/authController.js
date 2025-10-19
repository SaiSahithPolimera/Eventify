import { validationResult } from "express-validator";
import { queries } from "../db/queries.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 9;
const isProduction = process.env.NODE_ENV === 'production';

const signup = async (req, res) => {
    const { errors } = validationResult(req);

    if (errors.length !== 0) {
        const filteredErrors = errors.map(
            (err) => (err = { fieldName: err.path, message: err.msg })
        );
        return res.status(400).json({ errors: filteredErrors });
    }

    const { name, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (name && hashedPassword && email && role) {
        try {
            const message = await queries.createUser(name, email, hashedPassword, role);
            if (message === "success") {
                return res.json({
                    success: true,
                });
            }

            else if (message.error === "email already exists") {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists!",
                });
            }

            else {
                return res.status(400).json({
                    success: false,
                    message: "User registration failed!",
                });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error!",
            });
        }
    }
};


const login = async (req, res) => {
    const { errors } = validationResult(req);

    if (errors.length !== 0) {
        const filteredErrors = errors.map(
            (err) => (err = { fieldName: err.path, message: err.msg })
        );
        return res.status(400).json({ errors: filteredErrors });
    }

    const { email, password } = req.body;
    const userData = await queries.getUserCredentials(email);

    if (!userData) {
        return res.status(404).json({
            success: false,
            message: "User not found!",
        });
    }

    const isOrganizer = userData.role === "organizer";
    const isValid = await bcrypt.compare(password, userData.password_hash);

    if (isValid) {
        const token = jwt.sign({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        });
        return res.json({
            success: true,
            name: userData.name,
            isOrganizer: isOrganizer,
            message: "Login success!",
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "Incorrect password!",
        });
    }
};

const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    });
    return res.status(200).json({
        success: true,
        message: "Logout successful!"
    });
};

export { signup, login, logout };
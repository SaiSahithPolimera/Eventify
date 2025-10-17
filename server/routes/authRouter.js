import { Router } from "express";
import loginValidator from "../validators/loginValidator.js";
import signUpValidator from "../validators/signupValidator.js";
import { login, signup, logout} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/api/auth/login", loginValidator, login);
authRouter.post("/api/auth/signup", signUpValidator, signup);
authRouter.post("/api/auth/logout", logout);

export default authRouter;
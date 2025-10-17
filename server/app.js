import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    credentials: true
}));
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Welcome to Eventify API");
});

app.use(authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
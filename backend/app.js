import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";

connect();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());          

app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

export default app;
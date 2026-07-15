import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connect from "./db/db.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRouter from "./routes/ai.routes.js";

connect();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());   

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Zenith Workspace API is running 🚀",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Zenith is alive",
    uptime: process.uptime(),
  });
});

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/messages", messageRoutes);
app.use("/ai", aiRouter);

export default app;
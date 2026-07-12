import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
  getMessages,
  clearProjectChat,
  editMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/:projectId", authUser, getMessages);

router.delete(
  "/project/:projectId",
  authUser,
  clearProjectChat
);

router.patch(
  "/:messageId",
  authUser,
  editMessage
);

export default router;
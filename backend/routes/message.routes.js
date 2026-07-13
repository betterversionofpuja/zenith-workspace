import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
  getMessages,
  clearProjectChat,
  editMessage,
  regenerateMessage,
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

router.post(
  "/regenerate/:messageId",
  authUser,
  regenerateMessage
);

export default router;
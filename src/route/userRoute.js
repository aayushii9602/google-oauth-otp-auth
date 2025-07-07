import express from "express";

import signUp, {
  login,
  verifyOTP,
  getUserProfile,
} from "../controller/userController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/verify", verifyOTP);

router.get("/profile", authMiddleware, getUserProfile);

export default router;

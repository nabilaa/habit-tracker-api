import express from "express";
import { suggestHabits } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/suggest-habits", authenticateToken, suggestHabits);

export default router;
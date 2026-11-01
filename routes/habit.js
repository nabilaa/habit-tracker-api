import express from "express";
import { createHabit, getHabits, updateHabit, deleteHabit, archiveHabit, reorderHabits } from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, createHabit);
router.get("/", authenticateToken, getHabits);
router.put("/reorder", authenticateToken, reorderHabits);
router.put("/:id", authenticateToken, updateHabit);
router.delete("/:id", authenticateToken, deleteHabit);
router.put("/:id/archive", authenticateToken, archiveHabit);

export default router;

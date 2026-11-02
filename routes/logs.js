import express from "express";
import { 
    markCompleted, 
    umarkCompleted,
    getTodayLogs, 
    getRange, 
    getHeatMapData,
    getHabitStats,
    getAllStats
} from "../controllers/logController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, markCompleted);
router.delete("/", authenticateToken, umarkCompleted);
router.get("/today", authenticateToken, getTodayLogs);
router.get("/range", authenticateToken, getRange);
router.get("/heatmap", authenticateToken, getHeatMapData);
router.get("/stats/:habitId", authenticateToken, getHabitStats);
router.get("/stats", authenticateToken, getAllStats);   

export default router;

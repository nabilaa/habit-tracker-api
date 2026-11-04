import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

import { todayKey, last90DaysKeys, currentWeekKeys, lastNDaysKeys, calculateStreak } from "../utils/dateHelper.js";

 export const markCompleted = async (req, res) => {
    try {
        const { habitId, notes } = req.body;
        const userId = req.user._id;   
        const habit = await Habit.findOne({ _id: habitId, userId });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        const log = await HabitLog.findOneAndUpdate(
            { userId, habitId, completedDate: todayKey() },
            { $setOnOnInsert: { userId: req.user._id, habitId, completedDate: todayKey(), notes } },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: "Habit marked as completed", log });
    } catch (error) {
        console.error("Error marking habit as completed:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const umarkCompleted = async (req, res) => {
    try {
        const { habitId, date } = req.body;
        const completedDate = date || todayKey();
        await HabitLog.findOneAndDelete({ userId: req.user._id, habitId, completedDate });
        res.status(200).json({ message: "Habit unmarked as completed" });
    } catch (error) {
        console.error("Error unmarking habit as completed:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTodayLogs = async (req, res) => {
    try {
        const logs = await HabitLog.find({ userId: req.user._id, completedDate: todayKey() });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error retrieving today's logs:", error);
        res.status(500).json({ message: "Server error" });
    }   
};

export const getRange = async (req, res) => {
    try {
        const { start, end } = req.query;
        const logs = await HabitLog.find({
            userId: req.user._id,
            completedDate: { $gte: start, $lte: end }
        });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error retrieving habit logs by date range:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getHeatMapData = async (req, res) => {
    try {
        const days = last90DaysKeys();
        const logs = await HabitLog.find({ userId: req.user._id, completedDate: { $gte: days[0], $lte: days[days.length - 1] } });
        const counts = {};

        for (const day of days) {
            counts[day] = 0;
        }
        for (const log of logs) {
            counts[log.completedDate] = (counts[log.completedDate] || 0) + 1;
        }
        const heatMapData = days.map(date => ({
            date,
            count: counts[date] || 0
        }));
        res.status(200).json(heatMapData);
    }
    catch (error) {
        console.error("Error retrieving habit heat map data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getHabitStats = async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        const logs = await HabitLog.find({ userId: req.user._id, habitId: habit._id }).sort({ completedDate: -1 });
        const completedDates = logs.map(log => log.completedDate);
        const { current: currentStreak, longest: longestStreak } = calculateStreak(completedDates);

        const createdAt = habit.createdAt.toISOString().split('T')[0];
        const today = todayKey();
        const startDate = new Date(createdAt);
        const endDate = new Date(today);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const completionRate = totalDays > 0 ? (completedDates.length / totalDays) * 100 : 0;

        const monthlyCompletion = {};
        for (const log of logs) {
            const month = log.completedDate.slice(0, 7);
            monthlyCompletion[month] = (monthlyCompletion[month] || 0) + 1;
        }

        res.status(200).json({
            habit,
            totalCompletions: completedDates.length,
            currentStreak,
            longestStreak,
            completionRate: completionRate.toFixed(2),
            monthlyCompletion
        });
    } catch (error) {
        console.error("Error retrieving habit statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllStats = async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id, isArchived: false });
        const days = lastNDaysKeys(30);
        const logs = await HabitLog.find({ userId: req.user._id, completedDate: { $gte: days[0], $lte: days[days.length - 1] } });

        const habitStats = habits.map(habit => {
            const habitLogs = logs.filter(log => log.habitId.toString() === habit._id.toString());
            const completedDates = habitLogs.map(log => log.completedDate);
            const { current: currentStreak, longest: longestStreak } = calculateStreak(completedDates);

            return {
                habitId: habit._id,
                name: habit.name,
                icon: habit.icon,
                color: habit.color,
                category: habit.category,
                completions30d: habitLogs.length,
                currentStreak,
                longestStreak
            };
        });

        res.status(200).json({habitStats, days});
    } catch (error) {
        console.error("Error retrieving all habit statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

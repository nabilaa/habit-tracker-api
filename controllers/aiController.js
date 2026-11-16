import { SYSTEM_PROMPTS, chatCompletion } from "../utils/aiService.js";

export const suggestHabits = async (req, res) => {
    try {
        const { goals, productiveTime, struggles } = req.body;
        const userMsg = `User goals: ${goals || "not provided"}\nMost productive time: ${productiveTime || "not provided"}\nPast struggles: ${struggles || "not provided"}\n\nSuggest 3 personalized habits}`;
        const { content } = await chatCompletion({
            system: SYSTEM_PROMPTS.suggestion,
            user: userMsg
        });
        let suggestions = [];
        try {
            const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
            suggestions = parsed.suggestions || [];
        } catch {
            suggestions = [];
        }

        if (!suggestions.length) {
            suggestions = [
                {
                    name: "10-minute morning walk",
                    description: "Start the day with light movement and fresh air",
                    frequency: "Daily",
                    icon: "👟",
                    reason: "Low-friction way to build consistency early in the day"
                }
            ];
        }

        return res.status(200).json({ suggestions });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to generate habit suggestions",
            error: error.message
        });
    }
};
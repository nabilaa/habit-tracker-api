import { GoogleGenAI } from "@google/genai";

let client = null;
const getClient = () => {
    if (client) return client;
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    client = new GoogleGenAI({ apiKey: key });
    return client;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export const parseJSON = (text) => {
    let cleaned = (text || "").trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```\n?/g, "");
    }

    return JSON.parse(cleaned.trim());
}

export const SYSTEM_PROMPTS = {
    suggestion: "You are a helpful habit coach. Based on the user's goals, productive time, and past struggles, suggest exactly 3 personalized habits. Return valid JSON only with this format: {\"suggestions\":[{\"name\": \"...\", \"description\": \"...\", \"frequency\": \"DAILY|WEEKLY\", \"category\": \"Health|Productivity|Learning|Fitness|Mindfulness|Personal Development|Social|Finance|Other\", \"icon\":\"emoji\",\"reason\":\"...\"}] }"
};

export const chatCompletion = async ({ system, user }) => {
    const client = getClient();

    if (!client) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const response = await client.models.generateContent({
        model: MODEL,
        contents: user,
        config: {
            systemInstruction: system
        }
    });

    const content = response?.text || response?.candidates?.map((candidate) => {
        return candidate?.content?.parts?.map((part) => part?.text || "").join("") || "";
    }).join("") || "";

    return { content };
};
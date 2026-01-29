const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: process.env.AI_MODEL || "gemini-1.5-flash" });
    }

    async analyzeCrop(imagePath, metadata) {
        try {
            const language = metadata.language || 'en';
            console.log(`[AI Service] Processing request for language: ${language}`);

            // Mock diseases list for random selection
            const mockDiseases = [
                "Early Blight",
                "Late Blight",
                "Yellow Leaf Curl Virus",
                "Powdery Mildew",
                "Leaf Miner",
                "Bacterial Spot"
            ];

            // Randomly select one disease
            const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

            console.log(`[Mock Mode] Selected Disease: ${randomDisease}`);

            // Note: We are purposefully ignoring the image for this new flow as requested.
            // We just use the metadata and the randomly selected disease to generate the report.

            const prompt = `
        You are an expert plant pathologist. I have identified a potential issue with a crop.
        
        Details:
        - Crop: ${metadata.cropType}
        - Growth Stage: ${metadata.growthStage}
        - Season: ${metadata.season}
        - Identified Condition: ${randomDisease} (Simulated/Mock Diagnosis)

        Please generate a detailed treatment plan and description for this specific condition (${randomDisease}) on this crop (${metadata.cropType}).
        
        IMPORTANT: The user's language is "${language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}". 
        ALL text in the output (description, cause, treatment, prevention) MUST be in ${language === 'ta' ? 'Tamil' : 'English'}.
        Only the keys of the JSON object should remain in English.

        Return a JSON response strictly in this format:
        {
          "diseaseName": "${language === 'ta' ? '(Tamil Name of Disease)' : randomDisease}",
          "confidence": 85-98,
          "description": "Short description of symptoms and impact of ${randomDisease} on ${metadata.cropType} in ${language === 'ta' ? 'Tamil' : 'English'}.",
          "cause": "Explanation of why this happened and what caused it (in ${language === 'ta' ? 'Tamil' : 'English'}).",
          "treatment": {
            "chemical": ["One effective chemical treatment for ${randomDisease} (in ${language === 'ta' ? 'Tamil' : 'English'})"],
            "organic": ["One effective organic treatment for ${randomDisease} (in ${language === 'ta' ? 'Tamil' : 'English'})"],
            "prevention": ["One preventive measure (in ${language === 'ta' ? 'Tamil' : 'English'})"]
          },
          "prevention": ["List 2-3 steps to avoid this in the future (in ${language === 'ta' ? 'Tamil' : 'English'})"]
        }
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up code blocks if any
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanedText);

        } catch (error) {
            console.error("AI Analysis Failed:", error);

            // Fallback for demo/dev purposes if API fails (e.g., leaked key)
            console.warn("Falling back to MOCK DATA due to API error.");

            const isTamil = metadata.language === 'ta';
            const disease = "Early Blight";

            return {
                "diseaseName": isTamil ? "முன்னோடி வாடல் (Early Blight)" : disease,
                "confidence": 92,
                "description": isTamil
                    ? `தக்காளி செடியில் ${disease} நோய் காணப்படுகிறது. இலைகளில் பழுப்பு நிற புள்ளிகள் தோன்றும்.`
                    : `${disease} is a common fungal disease affecting tomatoes, characterized by brown spots on leaves.`,
                "cause": isTamil
                    ? "இது பூஞ்சை தொற்றால் ஏற்படுகிறது. அதிக ஈரப்பதம் இதற்கு காரணம்."
                    : "Caused by the fungus Alternaria solani, often due to high humidity.",
                "treatment": {
                    "chemical": [isTamil ? "மாங்கோசெப் (Mancozeb) தெளிக்கவும்." : "Spray Mancozeb."],
                    "organic": [isTamil ? "வேப்ப எண்ணெய் கரைசல் பயன்படுத்தவும்." : "Use Neem oil solution."],
                    "prevention": [isTamil ? "பயிர்களுக்கு இடையே இடைவெளி விடவும்." : "Ensure proper spacing between crops."]
                },
                "prevention": [isTamil ? "நோயுற்ற இலைகளை அகற்றவும்." : "Remove infected leaves immediately."]
            };
        }
    }
}

module.exports = new AIService();

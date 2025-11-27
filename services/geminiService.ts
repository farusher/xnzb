import { GoogleGenAI, Type } from "@google/genai";
import { User } from '../types';

// Use the API key from environment variables
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Model Constants
const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image'; // "Nano Banana" series

export const generateHostAvatar = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: prompt || "A realistic portrait of a friendly social media influencer, professional lighting, photorealistic, 4k" }]
      },
      config: {
         // Using default aspect ratio 1:1 for avatars
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate avatar:", error);
    return null;
  }
};

export const generateFakeUsers = async (count: number): Promise<User[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Generate ${count} realistic Chinese social media user profiles. 
      Includes nickname (creative, some with emojis), level (1-50), and location (major Chinese cities).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              level: { type: Type.INTEGER },
              location: { type: Type.STRING }
            },
            required: ["name", "level", "location"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const parsedData = JSON.parse(text);
    
    return parsedData.map((u: any, index: number) => ({
      id: `gen_${Date.now()}_${index}`,
      name: u.name,
      level: u.level,
      location: u.location,
      avatar: `https://picsum.photos/seed/${u.name}/200/200` // Fallback to fast placeholder for bulk list
    }));

  } catch (error) {
    console.error("Failed to generate users:", error);
    // Fallback if API fails
    return Array.from({ length: count }).map((_, i) => ({
      id: `fallback_${i}`,
      name: `User_${Math.floor(Math.random() * 1000)}`,
      level: Math.floor(Math.random() * 50) + 1,
      location: "Unknown",
      avatar: `https://picsum.photos/200/200?random=${i}`
    }));
  }
};

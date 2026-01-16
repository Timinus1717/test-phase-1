
import { GoogleGenAI } from "@google/genai";
import { Floor, InventoryItem } from "../types";

export async function getInfoDeskHint(floor: Floor, inventory: InventoryItem[], cash: number): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const inventoryList = inventory.length > 0 ? inventory.map(i => i.name).join(", ") : "nothing";
    
    const prompt = `You are a sarcastic but helpful 8-bit RPG mall guide. 
    Current Floor: ${floor}. 
    Inventory: ${inventoryList}. 
    Cash: $${cash}.
    The player needs to buy Medicine from Mannings (1/F) and complete Mr. Timothy's quest (2/F: needs Coffee, Donut, Lego).
    Give one sarcastic hint under 15 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 30,
        temperature: 0.9,
      }
    });

    return response.text?.trim() || "Just keep walking, kid. I'm on my lunch break.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error 404: AI is currently judging your outfit. Try again later.";
  }
}

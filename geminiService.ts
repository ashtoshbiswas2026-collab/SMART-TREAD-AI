import { getDoc, doc } from "firebase/firestore";
import { db } from "./lib/firebase";

// Helper to get API key from Firestore
const getApiKey = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'system'));
    if (docSnap.exists() && docSnap.data().geminiApiKey) {
      return docSnap.data().geminiApiKey;
    }
  } catch (error) {
    console.error("Error fetching API key:", error);
  }
  return null;
};

export const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
  try {
    const apiKey = await getApiKey();
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: systemInstruction || "You are a helpful AI assistant for a Bangladeshi small business owner. Reply in Bengali. Always use 'Namaskar' (নমস্কার) as the greeting instead of 'Assalamu Alaikum'.",
        jsonMode: false,
        apiKey
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate response');
    }

    return data.text || "দুঃখিত, আমি উত্তর দিতে পারছি না।";
  } catch (error: any) {
    console.error("AI Service Error:", error);
    return `দুঃখিত, আমি উত্তর দিতে পারছি না। (API Error: ${error.message || 'Unknown Error'})`;
  }
};

export const analyzeVoiceTransaction = async (text: string) => {
  const prompt = `
    Analyze this Bengali text for a business transaction: "${text}".
    Extract:
    1. Transaction Type (Income/Expense/Due)
    2. Amount (in Taka)
    3. Category/Item
    
    Output in JSON format only: { "type": "...", "amount": 0, "category": "..." }
  `;
  
  try {
    const apiKey = await getApiKey();
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        jsonMode: true,
        apiKey
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate response');
    }

    return data.text;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return `{"error": "${error.message}"}`;
  }
};

export const suggestInvoiceItems = async (query: string) => {
  const prompt = `
    Generate a list of invoice items with realistic prices in Bangladeshi Taka (BDT) based on this description: "${query}".
    If specific quantities are mentioned, use them. If not, assume 1.
    If specific prices are not mentioned, estimate realistic market prices for Bangladesh.
    
    Output ONLY a JSON array of objects with this structure:
    [
      { "name": "Product Name (in Bengali)", "price": 0, "qty": 1 }
    ]
  `;

  try {
    const apiKey = await getApiKey();
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        jsonMode: true,
        apiKey
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate response');
    }

    return data.text;
  } catch (error) {
    console.error("Suggestion Error:", error);
    return null;
  }
};


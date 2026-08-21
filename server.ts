import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, jsonMode, apiKey: clientApiKey } = req.body;
    const apiKey = clientApiKey || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server or provided by client." });
    }

    const groq = new Groq({ apiKey });

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    res.json({ text: chatCompletion.choices[0]?.message?.content || "" });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch response from Groq." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Setup Vite middleware or static files
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const vitePath = "vite";
    const { createServer: createViteServer } = await import(vitePath);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}

// Only setup frontend and listen if not running on Vercel
if (!process.env.VERCEL) {
  setupFrontend().then(() => {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;

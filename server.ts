import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("viral.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    ip TEXT PRIMARY KEY,
    credits INTEGER DEFAULT 2
  )
`);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/credits", (req, res) => {
    const ip = req.ip || "unknown";
    let user = db.prepare("SELECT credits FROM users WHERE ip = ?").get(ip) as { credits: number } | undefined;
    if (!user) {
      db.prepare("INSERT INTO users (ip, credits) VALUES (?, 2)").run(ip);
      user = { credits: 2 };
    }
    res.json({ credits: user.credits });
  });

  app.post("/api/generate", async (req, res) => {
    const { topic, platform } = req.body;
    const ip = req.ip || "unknown";

    const user = db.prepare("SELECT credits FROM users WHERE ip = ?").get(ip) as { credits: number } | undefined;
    if (!user || user.credits <= 0) {
      return res.status(403).json({ error: "Out of credits" });
    }

    try {
      // SECRET SAUCE: The prompt is hidden on the server
      const prompt = `You are an expert social media marketer and viral content strategist.
      Generate 3 highly engaging, viral hooks for a ${platform} video about "${topic}".
      For each hook, provide:
      1. The hook text itself (designed to grab attention in 3 seconds).
      2. The psychological trigger used (e.g., "Curiosity Gap", "FOMO", "Controversy").
      3. A predicted viral score out of 100.
      
      Return ONLY a JSON array of objects with keys: "hook", "psychology", "viralScore". Do not include markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "[]";
      const results = JSON.parse(text);

      // Decrement credits
      db.prepare("UPDATE users SET credits = credits - 1 WHERE ip = ?").run(ip);

      res.json({ results, credits: user.credits - 1 });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Failed to generate hooks" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ViralAI Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.post("/ask", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert HVAC service technician assistant. Give practical troubleshooting steps for field techs. Ask 1-2 key clarifying questions if needed. Use short bullet points. Include safety notes when relevant. Do not invent pressures/temps; if needed, ask for measurements.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.2,
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";
    res.json({ reply });
  } catch (err) {
    console.error("ASK ERROR:", err);
    res.status(500).json({ error: err?.message || "Chat failed" });
  }
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const fileForOpenAI = await toFile(
  fs.createReadStream(req.file.path),
  req.file.originalname || "audio.m4a"
);

const transcription = await client.audio.transcriptions.create({
  file: fileForOpenAI,
  model: "gpt-4o-mini-transcribe",
});

    fs.unlink(req.file.path, () => {});

    res.json({ text: transcription.text });
  } catch (err) {
  console.error("TRANSCRIBE ERROR:", err);

  // Send back the real error message (super helpful for debugging)
  res.status(500).json({
    error: err?.message || "Transcription failed",
  });
}
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`HVAC Pro server running on http://localhost:${PORT}`);
});
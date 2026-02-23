import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import "dotenv/config";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
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
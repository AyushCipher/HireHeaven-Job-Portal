import express, { json } from "express";
import cloudinary from "cloudinary";
import { rateLimiter } from "./utils/redisClient.js";
import { validate } from "@hireheaven/common";
import { careerSchema, resumeAnalyserSchema, uploadSchema } from "./validators.js";

const router = express.Router();

const aiLimiter = rateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  prefix: "utils-ai",
});

router.post("/upload", validate(uploadSchema), async (req, res) => {
  try {
    const { buffer, public_id } = req.body;

    if (public_id) {
      await cloudinary.v2.uploader.destroy(public_id);
    }

    // PDFs are uploaded as "raw" (the correct resource type for a
    // non-image document) with an explicit .pdf format so the delivered
    // URL/headers are correct (Content-Type: application/pdf,
    // Content-Disposition: inline) instead of a generic, extension-less
    // application/octet-stream that browsers force-download.
    //
    // NOTE: whether the file is "image" or "raw", Cloudinary's own
    // account-level security setting ("Allow delivery of PDF and ZIP
    // files", off by default) blocks public access to anything it
    // recognizes as a PDF/ZIP by extension — this upload succeeding does
    // not by itself mean the file is viewable. That setting has to be
    // enabled in the Cloudinary dashboard (Settings -> Security) for
    // resumes/JD PDFs to actually open.
    const isPdf = buffer.startsWith("data:application/pdf");

    const cloud = await cloudinary.v2.uploader.upload(buffer, {
      resource_type: isPdf ? "raw" : "auto",
      ...(isPdf ? { format: "pdf" } : {}),
    });

    res.json({
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

import dotenv from "dotenv";
import pdfParse from "pdf-parse";

dotenv.config();

// Google's Gemini models get retired/renamed over time (this project has
// already hit that once before, with both a stale Gemini model and later
// a removed Groq model) - verify against a live generateContent call if
// this ever 404s again rather than guessing a replacement name.
const GEMINI_MODEL = "gemini-3.6-flash";

/** Sends a prompt to Gemini's generateContent API and returns the model's raw text response. */
const askGemini = async (prompt: string): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gemini API request failed with status ${response.status}: ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text as string;
};

router.post("/career", aiLimiter, validate(careerSchema), async (req, res) => {
  try {
    const { skills } = req.body;

    const prompt = `
Based on the following skills: ${skills}.

Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
 "summary": "A brief, encouraging summary of the user's skill set and their general job
title.",
 "jobOptions": [
 {
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
 }
 ],
 "skillsToLearn": [
 {
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
Mastery', 'DevOps & Cloud').",
"skills": [
 {
 "title": "The name of the skill to learn.",
 "why": "Why learning this skill is important.",
 "how": "Specific examples of how to learn or apply this skill."
 }
]
 }
 ],
 "learningApproach": {
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
 }
}
 `;

    let rawText: string;
    try {
      rawText = await askGemini(prompt);
    } catch (error: any) {
      return res.status(502).json({ message: error.message });
    }

    let jsonResponse;

    try {
      const cleaned = rawText
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!cleaned) {
        throw new Error("Ai did not return a valid text response.");
      }

      jsonResponse = JSON.parse(cleaned);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned a response that was not valid JSON",
        rawResponse: rawText,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post(
  "/resume-analyser",
  aiLimiter,
  validate(resumeAnalyserSchema),
  async (req, res) => {
  try {
    const { pdfBase64 } = req.body;

    const pdfBuffer = Buffer.from(
      pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      "base64"
    );

    let resumeText: string;
    try {
      resumeText = (await pdfParse(pdfBuffer)).text.trim();
    } catch (error: any) {
      return res.status(400).json({
        message: `Could not read the PDF: ${error.message}`,
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        message: "No extractable text found in the PDF (it may be a scanned image).",
      });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance

Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": {
      "score": 90,
      "feedback": "Brief feedback on formatting"
    },
    "keywords": {
      "score": 80,
      "feedback": "Brief feedback on keyword usage"
    },
    "structure": {
      "score": 85,
      "feedback": "Brief feedback on resume structure"
    },
    "readability": {
      "score": 88,
      "feedback": "Brief feedback on readability"
    }
  },
  "suggestions": [
    {
      "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
'Structure')",
      "issue": "Description of the issue found",
      "recommendation": "Specific actionable recommendation to fix it",
      "priority": "high/medium/low"
    }
  ],
  "strengths": [
    "List of things the resume does well for ATS"
  ],
  "summary": "A brief 2-3 sentence summary of the overall ATS performance"
}

Focus on: - File format and structure compatibility - Proper use of standard section headings - Keyword optimization - Formatting issues (tables, columns, graphics, special characters) - Contact information placement - Date formatting - Use of action verbs and quantifiable achievements - Section organization and flow

Resume content (extracted from the uploaded PDF):
"""
${resumeText}
"""
`;

    let rawText: string;
    try {
      rawText = await askGemini(prompt);
    } catch (error: any) {
      return res.status(502).json({ message: error.message });
    }

    let jsonResponse;

    try {
      const cleaned = rawText
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!cleaned) {
        throw new Error("Ai did not return a valid text response.");
      }

      jsonResponse = JSON.parse(cleaned);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned a response that was not valid JSON",
        rawResponse: rawText,
      });
    }

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
  }
);

export default router;

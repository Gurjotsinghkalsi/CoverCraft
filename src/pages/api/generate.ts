import type { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { jobDesc, resume } = req.body;

  if (!jobDesc || !resume) {
    return res.status(400).json({ message: "Missing job description or resume" });
  }

  const prompt = `
  You are a professional job coach and resume expert.
  Write a polished, formal, and personalized cover letter tailored to the job description and resume provided.

  Job Description:
  ${jobDesc}

  Resume:
  ${resume}

  Begin the cover letter below:
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    console.log("Gemini response:", data); // optional: log for debugging

    const coverLetter =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini API";

    return res.status(200).json({ coverLetter });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ message: "Failed to generate cover letter" });
  }
}
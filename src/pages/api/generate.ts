import type { NextApiRequest, NextApiResponse } from "next";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { jobDesc, resume } = req.body;

  if (!jobDesc || !resume) {
    return res.status(400).json({ message: "Missing job description or resume" });
  }

  const prompt = `
    You are a professional career advisor and resume coach.
    Generate a personalized and professional cover letter tailored to the job description and resume below.

    Job Description:
    ${jobDesc}

    Resume:
    ${resume}

    Cover Letter:
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

    const coverLetter =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini API";

    return res.status(200).json({ coverLetter });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ message: "Failed to generate cover letter" });
  }
}
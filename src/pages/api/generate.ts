import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import generateFromGemini from "@/lib/gemini";
import { AuthOptions } from "next-auth";

const toneDescription: Record<string, string> = {
  formal: "polished and professional",
  friendly: "warm and conversational",
  concise: "brief and to the point",
  startup: "casual yet enthusiastic",
  ats: "optimized for Applicant Tracking Systems using keywords",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { jobDesc, resume, selectedTones } = req.body;

  if (!jobDesc || !resume || !selectedTones || !Array.isArray(selectedTones)) {
    return res.status(400).json({ message: "Missing job description, resume, or tones" });
  }

  try {
    const responses = await Promise.all(
      selectedTones.map(async (tone: string) => {
        const prompt = `
          You are a professional job coach and resume expert.
          Write a ${toneDescription[tone] || tone} and personalized cover letter tailored to the job description and resume provided.

          Job Description:
          ${jobDesc}

          Resume:
          ${resume}

          Begin the cover letter below:
        `;

        const result = await generateFromGemini(prompt);
        return { tone, content: result };
      })
    );

    return res.status(200).json({ coverLetters: responses });
  } catch (error) {
    console.error("Gemini generation error:", error);
    return res.status(500).json({ message: "Failed to generate cover letters" });
  }
}
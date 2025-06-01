import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure it's in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { jobDesc, resume } = req.body;

  if (!jobDesc || !resume) {
    return res.status(400).json({ message: "Missing job description or resume" });
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
You are a professional job coach and resume expert.
Generate a personalized cover letter tailored to the following job description and resume.

Job Description:
${jobDesc}

Resume:
${resume}

Cover Letter:
          `,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    const coverLetter = chatResponse.choices[0]?.message?.content || "No output generated.";

    res.status(200).json({ coverLetter });
  } catch (error: any) {
    console.error("Error from OpenAI:", error);
    res.status(500).json({ message: "Error generating cover letter" });
  }
}
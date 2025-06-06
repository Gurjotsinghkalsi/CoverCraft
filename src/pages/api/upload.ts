import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm ,File } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";

export const config = {
  api: {
    bodyParser: false, // Required for file upload
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ message: "Form parsing failed" });
      }
  
      console.log("Parsed files:", files);
  
      const resumeFile = files.resume;
      let file: File | undefined;
  
      if (Array.isArray(resumeFile)) {
        file = resumeFile[0];
      } else if (resumeFile) {
        file = resumeFile;
      }
  
      if (!file || !file.filepath) {
        console.error("No valid file path found:", file);
        return res.status(400).json({ message: "Invalid or missing file" });
      }
  
      const fileData = fs.readFileSync(file.filepath);
      const pdf = await pdfParse(fileData);
  
      console.log("Extracted text length:", pdf.text.length);
      const rawText = pdf.text;
      const cleanedText = rawText
        .replace(/[ \t]+/g, ' ')                  // collapse multiple spaces
        .replace(/\n{2,}/g, '\n\n')               // preserve double breaks
        .replace(/\n/g, ' ')                      // flatten single line breaks
        .replace(/([a-z])([A-Z])/g, '$1. $2')     // add space after sentence endings
        .replace(/•/g, '\n•')                     // ensure bullets go on new lines
        .replace(/(Projects|Summary|Education|Certifications|Technologies|Experience)/g, '\n\n$1\n')  // force section headers
        .trim();
      return res.status(200).json({ text: cleanedText });
  
    } catch (err) {
      console.error("Upload handler crash:", err);
      return res.status(500).json({ message: "PDF parsing failed" });
    }
  });
}
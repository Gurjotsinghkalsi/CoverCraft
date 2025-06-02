import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export async function downloadAsDocx(content: string, filename = "cover_letter.docx") {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line, font: "Calibri", size: 24 })],
            })
        ),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
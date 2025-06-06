import { useState, useEffect } from "react";
import { downloadAsDocx } from "@/utils/docExport";

export default function Home() {
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTones, setSelectedTones] = useState<string[]>(["formal"]);

  useEffect(() => {
    const savedJobDesc = localStorage.getItem("jobDesc");
    const savedResume = localStorage.getItem("resume");
    if (savedJobDesc) setJobDesc(savedJobDesc);
    if (savedResume) setResume(savedResume);
  }, []);

  useEffect(() => {
    localStorage.setItem("jobDesc", jobDesc);
  }, [jobDesc]);

  useEffect(() => {
    localStorage.setItem("resume", resume);
  }, [resume]);

  const generateCoverLetter = async () => {
    setLoading(true);
    setCoverLetter("");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDesc, resume, selectedTones }),
    });

    const data = await response.json();

    if (data.coverLetters && Array.isArray(data.coverLetters)) {
      const combinedLetters = data.coverLetters
        .map((c: any) => `--- ${c.tone.toUpperCase()} ---\n${c.content}`)
        .join("\n\n");
      setCoverLetter(combinedLetters);
    } else {
      setCoverLetter(data.coverLetter || "No content returned.");
    }

    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Upload failed: ${errText}`);
    }

    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      setResume(data.text);
    } else {
      throw new Error("Unexpected response format. Not JSON.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Cover Letter Generator using GEMINI AI</h1>

      <div className="mb-4">
        <label className="font-semibold block mb-2">Job Description</label>
        <textarea
          className="w-full border p-3 rounded resize-y"
          rows={6}
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste the job description here..."
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-2">Upload Resume (.pdf)</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          className="block text-sm border-2 text-gray-500 file:mr-4 file:py-2 file:px-4 cursor-pointer file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold block mb-2">Your Resume</label>
        <textarea
          className="w-full border p-3 rounded resize-y"
          rows={6}
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume content here..."
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Choose Tone(s):</label>
        <div className="grid grid-cols-2 gap-2">
          {["formal", "friendly", "concise", "startup", "ats"].map((tone) => (
            <label key={tone} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTones.includes(tone)}
                onChange={() =>
                  setSelectedTones((prev) =>
                    prev.includes(tone)
                      ? prev.filter((t) => t !== tone)
                      : [...prev, tone]
                  )
                }
              />
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={generateCoverLetter}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        disabled={loading || !jobDesc.trim() || !resume.trim() || selectedTones.length === 0}
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      <button
        onClick={() => {
          setResume("");
          setJobDesc("");
          setSelectedTones(["formal"]);
          setCoverLetter("");
          localStorage.clear();
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Reset All Fields
      </button>

      {coverLetter && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Cover Letter</h2>
          <div className="whitespace-pre-wrap border p-4 rounded text-black bg-gray-50 mb-4">
            {coverLetter}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(coverLetter);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>

            <button
              onClick={() => downloadAsDocx(coverLetter)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Download as Word File
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
import { useState } from "react";

export default function Home() {
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCoverLetter = async () => {
    setLoading(true);
    setCoverLetter("");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDesc, resume }),
    });

    const data = await response.json();
    setCoverLetter(data.coverLetter);
    setLoading(false);
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
        <label className="font-semibold block mb-2">Your Resume</label>
        <textarea
          className="w-full border p-3 rounded resize-y"
          rows={6}
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume content here..."
        />
      </div>

      <button
        onClick={generateCoverLetter}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {coverLetter && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated Cover Letter</h2>
          <div className="whitespace-pre-wrap border p-4 rounded bg-gray-50 text-black">
            {coverLetter}
          </div>
        </div>
      )}
    </main>
  );
}
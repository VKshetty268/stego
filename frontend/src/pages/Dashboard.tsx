import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import ResultsList from "../components/ResultsList";
import type { ScanResult } from "../components/ResultsList";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stats, setStats] = useState({ allScans: 0, threatsBlocked: 0, remainingScans: 50 });
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);

  const [preview, setPreview] = useState<string | null>(null); // file preview thumbnail
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // progress bar state
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  // --- Fetch stats
  const fetchStats = async () => {
    try {
      const res = await API.get("/files/stats");
      setStats(res.data);
    } catch {
      // silent fail
    }
  };

  // --- Fetch user
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUser();
  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // --- File selection (do not scan immediately)
  const onFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  // --- Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // --- Scan button handler
  const handleScan = async () => {
    if (!selectedFile) return;
    setError(null);
    setScanning(true);
    setProgress(0);

    // fake progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 5;
        return prev;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("files", selectedFile);

      const res = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResults((prev) => [...res.data.results, ...prev]); // prepend new result
      console.log("Scan API raw results:", res.data.results);
      await fetchStats();

      setProgress(100);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setScanning(false);
        setProgress(0);
        setPreview(null); // remove preview after scan
        setSelectedFile(null);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-teal-500 flex justify-center p-6 overflow-y-auto">
      <div className="w-[95%] max-w-6xl bg-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {/* Header with user info + stats */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-gray-400 text-sm">
              {user?.name || user?.email || "Stego User"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-gray-800 px-4 py-2 rounded-lg flex gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{stats.allScans}</p>
                <p className="text-xs text-gray-400">Scans To-Date</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{stats.threatsBlocked}</p>
                <p className="text-xs text-gray-400">Threats Blocked</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-400">{stats.remainingScans}</p>
                <p className="text-xs text-gray-400">Free Scans Left</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
          {/* Drag and drop + preview */}
          <div
            className="border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mb-3"
              />
            ) : (
              <>
                <p className="mb-2">Drag & drop a file here</p>
                <p className="text-sm mb-3">or</p>
              </>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-700"
            >
              Browse File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFilesChosen}
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!selectedFile || scanning}
            className={`w-full py-3 mt-4 rounded-xl ${
              !selectedFile || scanning
                ? "bg-green-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-base font-medium`}
          >
            {scanning ? "Scanning…" : "Scan"}
          </button>

          {/* Progress Bar */}
          {scanning && (
            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
        </div>

        {/* Results Section */}
        <ResultsList results={results} />

        {/* Info Banner */}
        <div className="bg-yellow-600 p-5 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg">
            If you’re worried that your images, videos, or documents may contain hidden data,
            StegoEnterprise by WetStone Labs can detect steganography in many types of common
            media files.
          </h3>
          <p className="text-sm text-yellow-100 mt-2">
            For more information beyond this trial:<br />
            Phone: (973) 818-9705<br />
            Email: sales@wetstonelabs.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

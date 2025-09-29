import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import ResultsList from "../components/ResultsList";
import type { ScanResult } from "../components/ResultsList";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stats, setStats] = useState({
    allScans: 0,
    threatsBlocked: 0,
    remainingScans: 50,
  });
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(
    null
  );

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  // toggle for supported file types list
  const [showFileTypes, setShowFileTypes] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  useEffect(() => {
    if (stats.remainingScans <= 0) {
      setShowLimitPopup(true);
    }
  }, [stats.remainingScans]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/files/stats");
      setStats(res.data);
    } catch { }
  };

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

  const onFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

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

  const handleScan = async () => {
    if (!selectedFile) return;
    setError(null);
    setScanning(true);
    setProgress(0);

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

      setResults((prev) => [...res.data.results, ...prev]);
      await fetchStats();

      setProgress(100);
    } catch (err: any) {
      const backendError = err?.response?.data?.error;

      if (backendError?.toLowerCase().includes("unsupported file type")) {
        setError("This file type is not supported. Please upload a supported file.");
      } else {
        setError(backendError || "Upload failed. Please try again.");
      }
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setScanning(false);
        setProgress(0);
        setPreview(null);
        setSelectedFile(null);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6 overflow-y-auto">
      <div className="w-[95%] max-w-6xl bg-white text-gray-900 rounded-2xl shadow-md p-8 flex flex-col gap-6 border border-gray-200">
        {/* Top Section with Contact + File Types */}
        <div className="bg-gray-100 p-5 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">
            If you’re worried that your images, videos, or documents may contain
            hidden data, StegoEnterprise by WetStone Labs can detect
            steganography in many types of common media files. Use this trial to
            see how it works and test your files below.
          </h3>

          {/* Toggle File Types */}
          <button
            onClick={() => setShowFileTypes(!showFileTypes)}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showFileTypes
              ? "Hide Supported File Types"
              : "Show Supported File Types"}
          </button>
          {showFileTypes && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p>
                JPEG, BMP, GIF, PNG, WAV, MP3, JPEG 2000, TIFF, PCX, 3GP, M4V,
                M4A, MOV, MP4, AVI, FLV, MPG/MPEG, ASF, OLE, MS Office Files,
                PDF, ICO, ELF, SWF, EXE, WEBM, OGG, NES, TEXT
              </p>
            </div>
          )}
        </div>

        {/* Header with user info + stats */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-gray-500 text-sm">
              {user?.name || user?.email || "Stego User"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-gray-100 px-6 py-3 rounded-lg flex gap-6 border border-gray-200">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {stats.allScans}
                </p>
                <p className="text-xs text-gray-500">Scans To-Date</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-500">
                  {stats.threatsBlocked}
                </p>
                <p className="text-xs text-gray-500">Threats Blocked</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">
                  {stats.remainingScans}
                </p>
                <p className="text-xs text-gray-500">Free Scans Left</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500"
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

          <button
            onClick={handleScan}
            disabled={!selectedFile || scanning}
            className={`w-full py-3 mt-4 rounded-lg font-medium text-white ${!selectedFile || scanning
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {scanning ? "Scanning…" : "Scan"}
          </button>

          {scanning && (
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mt-2">
              <div
                className="h-2 bg-green-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>

        {/* Results Section */}
        <div className="flex-1 gap-6 min-h-0">
          <ResultsList results={results} />
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-800 p-5 rounded-xl shadow-md">
          <h3 className="font-semibold text-lg text-white">Contact Sales</h3>
          <p className="text-sm text-blue-100 mt-2">
            For more information beyond this trial: <br />
            Phone: (973) 818-9705 <br />
            Email: sales@wetstonelabs.com
          </p>
          <button
            onClick={() => window.location.href = "mailto:sales@wetstonelabs.com"}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* Persistent Popup when scans are exhausted */}
      {showLimitPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white text-black rounded-xl shadow-xl p-8 max-w-lg w-full text-center pointer-events-auto border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">
              You have reached your free scan limit
            </h2>
            <p className="text-gray-600 mb-3">
              Thank you for using the StegoEnterprise trial platform.
            </p>
            <p className="text-gray-600 mb-3">
              To continue scanning files, or if you believe your system may
              contain hidden or infected content, please contact our sales team
              to learn more about the full version of StegoEnterprise for your
              organization.
            </p>
            <div className="text-gray-800 font-medium mt-4">
              <p>Contact Sales:</p>
              <p>Phone: (973) 818-9705</p>
              <p>Email: sales@wetstonelabs.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

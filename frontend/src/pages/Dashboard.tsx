// src/pages/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaFolder, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import UpgradeModal from "../components/upgradeModal"; // <-- import modal

type ScanResult = { filename: string; status: "safe" | "malicious" };

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const [stats, setStats] = useState({ scansToday: 0, threatsBlocked: 0 });
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(
    null
  );
  const [showUpgrade, setShowUpgrade] = useState(false); // <-- modal state

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

  // --- File upload
  const onSelectFiles = () => fileInputRef.current?.click();
  const onFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((f) => formData.append("files", f));
      const res = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data.results || []);
      await fetchStats();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Folder upload
  const onSelectFolder = () => folderInputRef.current?.click();
  const onFolderChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((f) => formData.append("files", f));
      const res = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data.results || []);
      await fetchStats();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center p-6">
      <div className="w-[95%] max-w-5xl bg-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-gray-400 text-sm">
              {user?.name || user?.email || "Stego User"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Device Protected Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">Device Protected</h3>
            <p className="text-gray-400 text-sm">No threats found today</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {stats.scansToday}
              </p>
              <p className="text-xs text-gray-400">Scans Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {stats.threatsBlocked}
              </p>
              <p className="text-xs text-gray-400">Threats Blocked</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
          <button
            onClick={onSelectFiles}
            disabled={uploading}
            className={`w-full py-3 rounded-xl ${
              uploading ? "bg-green-700" : "bg-green-500 hover:bg-green-600"
            } text-base font-medium`}
          >
            {uploading ? "Scanning…" : "Select an Image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={onFilesChosen}
          />

          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}

          {!!results.length && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2"
                >
                  <span className="truncate mr-2">{r.filename}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "safe" ? "bg-green-700" : "bg-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Folders */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">Selected Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={onSelectFolder}
              className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:bg-gray-700 border border-dashed border-gray-600"
            >
              <FaPlus className="text-2xl mb-2 text-yellow-400" />
              <p className="font-medium text-yellow-400">Add Folder</p>
              <p className="text-gray-400 text-sm">Premium</p>
            </div>
          </div>
        </div>

        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={onFolderChosen}
          // @ts-ignore non-standard attributes
          webkitdirectory=""
          // @ts-ignore
          directory=""
        />

        {/* Upgrade Banner */}
        <div className="bg-yellow-600 p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
            <p className="text-sm text-yellow-100">
              Auto-scan & real-time protection
            </p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="mt-3 md:mt-0 px-6 py-2 bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
};

export default Dashboard;

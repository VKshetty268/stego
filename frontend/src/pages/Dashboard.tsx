import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import UploadButton from "../components/UploadButton";
import FolderCard from "../components/FolderCard";
import UpgradeBanner from "../components/UpgradeBanner";
import api from "../api/api";

/**
 * Dashboard replicates the visual structure of your screenshot, adapted to web.
 * - Pulls upload status (used/limit)
 * - Big "Select an Image" button that uploads 1 file to /api/upload
 * - "Selected Folders" showcase (static)
 * - Upgrade banner
 */
export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [uploadsUsed, setUploadsUsed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [scansToday, setScansToday] = useState(24);   // demo stats; wire to API later if desired
  const [threatsBlocked, setThreatsBlocked] = useState(2);
  const [lastVerdict, setLastVerdict] = useState<string>("");

  async function refreshStatus() {
    try {
      const { data } = await api.get("/upload/status");
      setUploadsUsed(data.uploadsUsed ?? 0);
      setLimit(data.limit ?? 5);
    } catch (err) {
      // not logged in or server error – the ProtectedRoute should usually prevent this
      console.warn("status error", err);
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  function handleUploaded(verdict: string, used: number) {
    setLastVerdict(verdict);
    setUploadsUsed(used);
    setScansToday((n) => n + 1);
    if (verdict !== "clean") setThreatsBlocked((n) => n + 1);
  }

  const limitReached = uploadsUsed >= limit;

  return (
    <Layout onSignOut={onLogout} userName="Stego User">
      {/* Top status card */}
      <StatCard
        scansToday={scansToday}
        threatsBlocked={threatsBlocked}
        subtitle={lastVerdict ? `Latest result: ${lastVerdict}` : "No threats found today"}
      />

      {/* Upload CTA */}
      <div className="mt-4 card-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-textSoft">Upload</div>
          <button className="btn-ghost" onClick={refreshStatus}>Refresh</button>
        </div>

        <UploadButton onUploaded={handleUploaded} disabled={limitReached} />

        {limitReached && (
          <div className="mt-3 text-sm text-textSoft">
            You’ve reached your trial limit. Enjoying Stego?{" "}
            <a className="underline decoration-dotted" href="#" onClick={(e)=>e.preventDefault()}>
              Contact sales
            </a>
            .
          </div>
        )}
      </div>

      {/* Selected Folders */}
      <div className="mt-6">
        <div className="section-title mb-2">Selected Folders</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FolderCard label="WhatsApp Images" count={0} />
          <FolderCard label="WhatsApp Documents" count={0} />
          <FolderCard label="Instagram" count={0} />
          <FolderCard label="Add Folder" count={0} variant="premium" />
        </div>
      </div>

      {/* Upgrade banner */}
      <div className="mt-6">
        <UpgradeBanner />
      </div>
    </Layout>
  );
}

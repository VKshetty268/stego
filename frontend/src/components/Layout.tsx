import React from "react";
import api from "../api/api";

type Props = {
  children: React.ReactNode;
  onSignOut?: () => void;
  userName?: string;
};

export default function Layout({ children, onSignOut, userName = "Stego User" }: Props) {
  async function signOut() {
    try { await api.post("/auth/logout"); } catch {}
    onSignOut?.();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur bg-canvas/80 border-b border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-textSoft">Welcome back</div>
            <div className="text-lg font-semibold">{userName}</div>
          </div>
          <button className="btn-ghost" onClick={signOut}>Sign Out</button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}

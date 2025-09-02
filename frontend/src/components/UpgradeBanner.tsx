import React from "react";
import { Crown } from "lucide-react";

export default function UpgradeBanner() {
  return (
    <div className="card-soft flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-yellow-500/15 text-yellow-400">
          <Crown size={18} />
        </div>
        <div>
          <div className="font-semibold">Upgrade to Premium</div>
          <div className="text-sm text-textSoft">Auto-scan & real-time protection</div>
        </div>
      </div>
      <button className="btn-ghost">Learn more →</button>
    </div>
  );
}

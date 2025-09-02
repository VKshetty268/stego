import React from "react";
import { ShieldCheck, Activity, Bug } from "lucide-react";

type Props = {
  scansToday: number;
  threatsBlocked: number;
  subtitle?: string;
};

export default function StatCard({ scansToday, threatsBlocked, subtitle }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-base font-semibold">Device Protected</div>
            <div className="text-textSoft text-sm">{subtitle ?? "No threats found today"}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="card-soft">
          <div className="flex items-center gap-2 text-textSoft text-sm">
            <Activity size={16} /> Scans Today
          </div>
          <div className="text-3xl font-bold mt-1">{scansToday}</div>
        </div>
        <div className="card-soft">
          <div className="flex items-center gap-2 text-textSoft text-sm">
            <Bug size={16} /> Threats Blocked
          </div>
          <div className="text-3xl font-bold mt-1 text-warning">{threatsBlocked}</div>
        </div>
      </div>
    </div>
  );
}

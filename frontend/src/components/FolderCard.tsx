import React from "react";
import { Folder } from "lucide-react";

type Props = {
  label: string;
  count: number;
  variant?: "default" | "premium";
};

export default function FolderCard({ label, count, variant = "default" }: Props) {
  const premium = variant === "premium";
  return (
    <div
      className={`card-soft hover:bg-card/80 transition group ${
        premium ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5">
          <Folder size={20} className="text-textSoft group-hover:text-textBase" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          <div className="text-xs text-textSoft">{count} items</div>
        </div>
        {premium && (
          <span className="text-xs text-primary border border-primary/30 rounded px-2 py-0.5">
            Premium
          </span>
        )}
      </div>
    </div>
  );
}

import React from "react";
import ResultItem from "./ResultItem";

export type ScanResult = {
  filename: string;
  status: "safe" | "malicious";
  details?: any; // raw report from backend
};

interface Props {
  results: ScanResult[];
  className?: string;
}

const ResultsList: React.FC<Props> = ({ results, className }) => {
  const malicious = results.filter((r) => r.status === "malicious");
  const safe = results.filter((r) => r.status === "safe");

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
        className || ""
      } h-full`}
    >
      {/* Malicious Section */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm h-full flex flex-col">
        <h3 className="text-red-600 font-semibold mb-3">Malicious Files</h3>
        <div className="flex-1 overflow-y-auto">
          {!malicious.length && (
            <p className="text-gray-500 text-sm">
              No malicious files this session
            </p>
          )}
          {malicious.map((r, i) => (
            <ResultItem key={`malicious-${i}`} result={r} />
          ))}
        </div>
      </div>

      {/* Safe Section */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm h-full flex flex-col">
        <h3 className="text-green-600 font-semibold mb-3">Safe Files</h3>
        <div className="flex-1 overflow-y-auto">
          {!safe.length && (
            <p className="text-gray-500 text-sm">No safe files this session</p>
          )}
          {safe.map((r, i) => (
            <ResultItem key={`safe-${i}`} result={r} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsList;

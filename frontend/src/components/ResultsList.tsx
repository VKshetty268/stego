import React from "react";
import ResultItem from "./ResultItem";

export type ScanResult = {
  filename: string;
  status: "safe" | "malicious";
  details?: any; // raw report from backend
};

interface Props {
  results: ScanResult[];
}

const ResultsList: React.FC<Props> = ({ results }) => {
  const malicious = results.filter((r) => r.status === "malicious");
  const safe = results.filter((r) => r.status === "safe");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Malicious Section */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-md h-64 overflow-y-auto">
        <h3 className="text-red-400 font-semibold mb-3">Malicious Files</h3>
        {!malicious.length && (
          <p className="text-gray-400 text-sm">No malicious files this session</p>
        )}
        {malicious.map((r, i) => (
          <ResultItem key={`malicious-${i}`} result={r} />
        ))}
      </div>

      {/* Safe Section */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-md h-64 overflow-y-auto">
        <h3 className="text-green-400 font-semibold mb-3">Safe Files</h3>
        {!safe.length && (
          <p className="text-gray-400 text-sm">No safe files this session</p>
        )}
        {safe.map((r, i) => (
          <ResultItem key={`safe-${i}`} result={r} />
        ))}
      </div>
    </div>
  );
};

export default ResultsList;

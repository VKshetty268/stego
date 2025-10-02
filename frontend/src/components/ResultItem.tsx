import React, { useState } from "react";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

type Detection = {
  finding: string;
  severity: string;
  type: string;
};

type FileDetails = {
  file_type?: string;
  filename?: string;
  status?: string;
  detected?: boolean;
  severity?: string;
  malware_scan_elapsed_time?: string;
  detections?: Detection[];
};

type Props = {
  result: {
    filename: string;
    status: "safe" | "malicious";
    details?: FileDetails | null;
    previewUrl?: string | null;
  };
};

// helper to sanitize filenames
function safeFilename(name: string) {
  return name.normalize("NFKD").replace(/×/g, "x");
}

const ResultItem: React.FC<Props> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  const thumbnail = result.previewUrl ? (
    <img
      src={result.previewUrl}
      alt={safeFilename(result.filename)}
      className="w-10 h-10 object-cover rounded mr-3"
    />
  ) : null;

  if (result.status === "malicious") {
    const d = result.details;

    return (
      <div className="bg-white rounded-lg p-3 mb-2 border border-red-300 shadow-sm">
        <button
          className="w-full flex justify-between items-center text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center truncate pr-3 font-medium text-red-700">
            {thumbnail}
            <span>{safeFilename(result.filename)}</span>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
            <FaTimesCircle className="text-red-600" />
          </div>
        </button>

        {expanded && (
          <div className="mt-2 text-xs text-gray-600 space-y-1 border-t border-gray-200 pt-2">
            {d ? (
              <>
                {d.file_type && (
                  <p>
                    <strong>File Type:</strong> {d.file_type}
                  </p>
                )}
                {d.status && (
                  <p>
                    <strong>Status:</strong> {d.status}
                  </p>
                )}
                <p>
                  <strong>Detected:</strong>{" "}
                  {d.detected ? "Yes" : d.detected === false ? "No" : "N/A"}
                </p>
                {d.severity && (
                  <p>
                    <strong>Severity:</strong> {d.severity}
                  </p>
                )}
                {d.malware_scan_elapsed_time && (
                  <p>
                    <strong>Malware Scan Time:</strong>{" "}
                    {d.malware_scan_elapsed_time}
                  </p>
                )}

                {d.detections && d.detections.length > 0 && (
                  <div className="mt-2">
                    <strong>Findings:</strong>
                    <ul className="list-disc ml-5">
                      {d.detections.map((f, i) => (
                        <li key={i}>
                          {f.finding} ({f.severity}, {f.type}
                          )
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p>No additional details available.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 mb-2 flex justify-between items-center border border-green-200 shadow-sm">
      <div className="flex items-center text-green-700 font-medium">
        {thumbnail}
        <span className="truncate pr-3">{safeFilename(result.filename)}</span>
      </div>
      <FaCheckCircle className="text-green-600" />
    </div>
  );
};

export default ResultItem;

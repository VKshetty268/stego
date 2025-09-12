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
  mitigated?: boolean;
};

type FileDetails = {
  file_type?: string;
  filename?: string;
  status?: string;
  detected?: boolean;
  severity?: string;
  malware_scan_elapsed_time?: string; // 👈 updated here
  detections?: Detection[];
  mitigated?: boolean | null;
};

type Props = {
  result: {
    filename: string;
    status: "safe" | "malicious";
    details?: FileDetails | null;
  };
};

const ResultItem: React.FC<Props> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  if (result.status === "malicious") {
    const d = result.details;

    return (
      <div className="bg-gray-900 rounded-lg p-2 mb-2 border border-red-500">
        <button
          className="w-full flex justify-between items-center text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="truncate pr-3 font-medium">{result.filename}</span>
          <div className="flex items-center gap-2">
            {expanded ? (
              <FaChevronUp className="text-gray-400" />
            ) : (
              <FaChevronDown className="text-gray-400" />
            )}
            <FaTimesCircle className="text-red-500" />
          </div>
        </button>

        {expanded && (
          <div className="mt-2 text-xs text-gray-300 space-y-1 border-t border-gray-700 pt-2">
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
                {d.malware_scan_elapsed_time && ( // 👈 changed to malware_scan_elapsed_time
                  <p>
                    <strong>Malware Scan Time:</strong>{" "}
                    {d.malware_scan_elapsed_time}
                  </p>
                )}
                {typeof d.mitigated !== "undefined" && (
                  <p>
                    <strong>Mitigated:</strong>{" "}
                    {d.mitigated === true
                      ? "Yes"
                      : d.mitigated === false
                      ? "No"
                      : "N/A"}
                  </p>
                )}

                {d.detections && d.detections.length > 0 && (
                  <div className="mt-2">
                    <strong>Findings:</strong>
                    <ul className="list-disc ml-5">
                      {d.detections.map((f, i) => (
                        <li key={i}>
                          {f.finding} ({f.severity}, {f.type}, mitigated:{" "}
                          {f.mitigated ? "Yes" : "No"})
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
    <div className="bg-gray-900 rounded-lg p-2 mb-2 flex justify-between items-center">
      <span className="truncate pr-3">{result.filename}</span>
      <FaCheckCircle className="text-green-500" />
    </div>
  );
};

export default ResultItem;

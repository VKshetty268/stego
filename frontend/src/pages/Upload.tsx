// src/pages/Upload.tsx
import React, { useState } from "react";
import API from "../api/api";

const Upload: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Files uploaded successfully!");
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <div>
      <h2>Upload Files</h2>
      <input type="file" multiple onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;

// src/pages/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>Welcome to Stego Trial Portal</h2>
      <p>You can upload up to 5 files for malware check.</p>
      <Link to="/upload">Go to Upload Page</Link>
    </div>
  );
};

export default Dashboard;

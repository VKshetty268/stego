import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";

interface UserData {
  _id: string;
  name?: string;
  email: string;
  organization?: string;
  filesScanned: number;
  threatsDetected: number;
  remainingScans: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalScans: 0, threatsDetected: 0 });
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await API.get("/admin/stats");
        setStats(statsRes.data);

        const usersRes = await API.get("/admin/users");
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users.map((u) => ({
      Name: u.name || "N/A",
      Email: u.email,
      Organization: u.organization || "N/A",
      "Files Scanned": u.filesScanned,
      "Threats Detected": u.threatsDetected,
      "Remaining Free Scans": u.remainingScans,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-400 to-teal-500 flex justify-center p-6">
      <div className="w-[95%] max-w-6xl bg-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-lg">Total Users</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-lg">Total Scans</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.totalScans}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-lg">Threats Detected</p>
            <p className="text-2xl font-bold text-red-400">{stats.threatsDetected}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg">
          <table className="table-auto w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Organization</th>
                <th className="px-4 py-2">Files Scanned</th>
                <th className="px-4 py-2">Threats Detected</th>
                <th className="px-4 py-2">Remaining Free Scans</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{u.name || "N/A"}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.organization || "N/A"}</td>
                  <td className="px-4 py-2">{u.filesScanned}</td>
                  <td className="px-4 py-2">{u.threatsDetected}</td>
                  <td className="px-4 py-2">{u.remainingScans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToExcel}
          className="self-end mt-3 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

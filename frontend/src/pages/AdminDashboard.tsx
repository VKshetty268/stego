import React, { useEffect, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

interface UserData {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  organization?: string;
  filesScanned: number;
  threatsDetected: number;
  remainingScans: number;
  lastScanAt?: string | null;
}

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString() : "Never";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    threatsDetected: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/users"),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Failed to load admin data", err);
        setUsers([]);
      }
    };
    fetchData();
  }, []);

  const exportToExcel = () => {
    const rows = users.map((u) => ({
      Name: u.name || "N/A",
      Email: u.email,
      Phone: u.phone || "N/A",
      Organization: u.organization || "N/A",
      "Files Scanned": u.filesScanned ?? 0,
      "Threats Detected": u.threatsDetected ?? 0,
      "Remaining Free Scans": u.remainingScans ?? 0,
      "Last Scan Date": fmtDate(u.lastScanAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
  };

  const signOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center p-6 overflow-y-auto">
      <div className="w-[95%] max-w-6xl bg-white text-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-gray-200">
        {/* Header with title + sign out */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600">Total Scans</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalScans}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600">Threats Detected</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.threatsDetected}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="table-auto w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Organization</th>
                <th className="px-4 py-2">Files Scanned</th>
                <th className="px-4 py-2">Threats Detected</th>
                <th className="px-4 py-2">Remaining Free Scans</th>
                <th className="px-4 py-2">Last Scan Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{u.name || "N/A"}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.phone || "N/A"}</td>
                  <td className="px-4 py-2">{u.organization || "N/A"}</td>
                  <td className="px-4 py-2">{u.filesScanned ?? 0}</td>
                  <td className="px-4 py-2">{u.threatsDetected ?? 0}</td>
                  <td className="px-4 py-2">{u.remainingScans ?? 0}</td>
                  <td className="px-4 py-2">{fmtDate(u.lastScanAt)}</td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td
                    className="px-4 py-4 text-gray-500 text-center"
                    colSpan={8}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToExcel}
          className="self-end mt-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

// src/pages/Dashboard.tsx
import React from "react";
import { FaFolder, FaPlus } from "react-icons/fa";

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center p-6">
      <div className="w-[95%] max-w-5xl bg-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="text-gray-400 text-sm">Stego User</p>
          </div>
          <button
            onClick={() => {}}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium"
          >
            Sign Out
          </button>
        </div>

        {/* Device Protected Card */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">Device Protected</h3>
            <p className="text-gray-400 text-sm">No threats found today</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">24</p>
              <p className="text-xs text-gray-400">Scans Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">2</p>
              <p className="text-xs text-gray-400">Threats Blocked</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-md">
          <button
            onClick={() => {}}
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-base font-medium"
          >
            Select an Image
          </button>
        </div>

        {/* Selected Folders */}
        <div>
          <h3 className="text-sm text-gray-400 mb-3">Selected Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:bg-gray-700">
              <FaFolder className="text-2xl mb-2" />
              <p className="font-medium">WhatsApp Images</p>
              <p className="text-gray-400 text-sm">245 items</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:bg-gray-700">
              <FaFolder className="text-2xl mb-2" />
              <p className="font-medium">WhatsApp Documents</p>
              <p className="text-gray-400 text-sm">87 items</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:bg-gray-700">
              <FaFolder className="text-2xl mb-2" />
              <p className="font-medium">Instagram</p>
              <p className="text-gray-400 text-sm">156 items</p>
            </div>
            <div
              onClick={() => {}}
              className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:bg-gray-700 border border-dashed border-gray-600"
            >
              <FaPlus className="text-2xl mb-2 text-yellow-400" />
              <p className="font-medium text-yellow-400">Add Folder</p>
              <p className="text-gray-400 text-sm">Premium</p>
            </div>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="bg-yellow-600 p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
            <p className="text-sm text-yellow-100">
              Auto-scan & real-time protection
            </p>
          </div>
          <button
            onClick={() => {}}
            className="mt-3 md:mt-0 px-6 py-2 bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

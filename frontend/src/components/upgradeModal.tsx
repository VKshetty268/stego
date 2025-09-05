// src/components/UpgradeModal.tsx
import React from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Upgrade to Premium</h2>
        <p className="text-gray-300 text-sm mb-4">
          We’re glad you like our product!  
          For additional capabilities such as auto-scanning and real-time protection, please contact our sales team at:  
        </p>
        <p className="text-yellow-400 font-medium text-lg mb-4">
          📞 (123) 456-7890
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              // If you want, redirect to a contact page later
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

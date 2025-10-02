import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const GoogleOnboarding = () => {
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState<string>("Loading terms...");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      await API.post(
        "/auth/google-onboarding",
        { organization, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  // Load terms text once when modal is opened
  useEffect(() => {
    if (showTerms) {
      fetch("/terms.md")
        .then((res) => res.text())
        .then((text) => setTermsText(text))
        .catch(() =>
          setTermsText("Failed to load terms. Please try again later.")
        );
    }
  }, [showTerms]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white p-4">
      <div className="w-[90%] max-w-sm md:max-w-md p-6 bg-white text-black flex flex-col items-center gap-4 rounded-2xl shadow-lg border border-gray-200">

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-center text-gray-900">
          Complete Your Profile
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center">
          Please provide your Phone number and Organization to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 outline-none text-sm md:text-base focus:ring-2 focus:ring-green-500 transition"
            required
          />
          <input
            type="text"
            placeholder="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 outline-none text-sm md:text-base focus:ring-2 focus:ring-green-500 transition"
            required
          />

          {/* Terms and Conditions */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              className="cursor-pointer"
            />
            <span>
              I accept the terms and conditions{" "}
              <span
                className="text-green-600 cursor-pointer underline"
                onClick={() => setShowTerms(true)}
              >
                Read terms and agreements
              </span>
            </span>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className={`w-full p-3 rounded-xl mt-3 text-sm md:text-base font-medium text-white ${!acceptTerms || loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
              } transition`}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] h-[90%] rounded-xl shadow-xl p-6 text-gray-800 relative flex flex-col">
            {/* Header */}
            <h2 className="text-2xl font-bold mb-4">Terms and Agreements</h2>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto text-base md:text-lg text-gray-700 whitespace-pre-wrap pr-2 leading-relaxed">
              {termsText}
            </div>

            {/* Footer Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleOnboarding;

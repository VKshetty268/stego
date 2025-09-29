import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const GoogleOnboarding = () => {
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
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

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white p-4">
      <div className="w-[90%] max-w-sm md:max-w-md p-6 bg-white text-black flex flex-col items-center gap-4 rounded-2xl shadow-lg border border-gray-200">
        
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-center text-gray-900">
          Complete Your Profile
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center">
          Please provide your phone and organization to continue
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

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-xl mt-3 text-sm md:text-base font-medium text-white ${
              loading
                ? "bg-green-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } transition`}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoogleOnboarding;

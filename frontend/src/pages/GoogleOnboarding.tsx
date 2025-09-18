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

      navigate("/dashboard"); // ✅ only first time
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm md:max-w-md p-5 bg-gray-900 text-white flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        <h1 className="text-lg md:text-xl font-semibold">Complete Your Profile</h1>
        <p className="text-xs md:text-sm text-gray-400 text-center">
          Please provide your phone and organization to continue
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-2">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="p-2 rounded-lg bg-gray-800 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="p-2 rounded-lg bg-gray-800 outline-none"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-green-500 rounded-xl mt-3 hover:bg-green-600 text-sm md:text-base"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoogleOnboarding;

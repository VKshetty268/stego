import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const email = localStorage.getItem("pendingEmail");
      if (!email) throw new Error("No email found for verification");

      await API.post("/auth/verify-otp", { email, otp });
      localStorage.removeItem("pendingEmail");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-lg">
        <h1 className="text-lg md:text-xl font-semibold">Verify Your Email</h1>
        <p className="text-xs md:text-sm text-gray-500 text-center">
          We've sent you an email with a One-time Password. Please enter it below.
        </p>

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-3 mt-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="bg-gray-800 p-2 rounded-xl text-white outline-none text-center"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-green-500 rounded-xl mt-3 hover:bg-green-600"
          >
            {loading ? "Verifying…" : "Verify Email"}
          </button>
        </form>

        <p
          className="text-sm text-gray-400 cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

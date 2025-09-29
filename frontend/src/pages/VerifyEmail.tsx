import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const email = localStorage.getItem("pendingEmail");
      if (!email) throw new Error("No email found for verification");

      const res = await API.post("/auth/verify-otp", { email, otp });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      localStorage.removeItem("pendingEmail");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setResending(true);

    try {
      const email = localStorage.getItem("pendingEmail");
      if (!email) throw new Error("No email found for resend");

      await API.post("/auth/resend-otp", { email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[90%] max-w-sm p-6 bg-white flex-col flex items-center gap-3 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Verify Your Email
        </h1>
        <p className="text-xs md:text-sm text-gray-600 text-center">
          We&apos;ve sent you an email with a One-time Password. Please enter it
          below.
        </p>

        <form
          onSubmit={handleVerify}
          className="w-full flex flex-col gap-3 mt-2"
        >
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border border-gray-300 p-2 rounded-xl text-gray-900 outline-none text-center focus:ring-2 focus:ring-green-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-green-500 text-white rounded-xl mt-3 hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? "Verifying…" : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP Button */}
        <button
          onClick={handleResend}
          disabled={resending}
          className="mt-3 text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          {resending ? "Resending…" : "Resend OTP"}
        </button>

        <p
          className="text-sm text-gray-500 cursor-pointer hover:underline mt-2"
          onClick={() => navigate("/")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

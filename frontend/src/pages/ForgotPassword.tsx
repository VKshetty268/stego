import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      setMessage("Password reset link sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-[90%] max-w-sm md:max-w-md p-8 bg-white flex flex-col items-center gap-5 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
        <p className="text-sm text-gray-500 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-3">
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <MdEmail className="text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-lg mt-2 hover:bg-green-700 font-medium"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full p-3 border border-gray-300 rounded-lg mt-3 hover:bg-gray-100 text-sm md:text-base text-gray-700 font-medium"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;

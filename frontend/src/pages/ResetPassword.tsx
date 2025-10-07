import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFingerprint, FaEye, FaEyeSlash } from "react-icons/fa";
import zxcvbn from "zxcvbn"; // ✅ Password strength analysis
import API from "../api/api";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // strength analysis
  const analysis = zxcvbn(password);
  const score = analysis.score; // 0–4
  const feedback = analysis.feedback.suggestions;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (score < 3) {
      setError("Password is too weak. Please make it stronger.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message || "Password reset successfully!");
      setTimeout(() => navigate("/"), 2000); // redirect to login after success
    } catch (err: any) {
      setError(err?.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-[90%] max-w-sm md:max-w-md p-8 bg-white flex flex-col gap-5 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Password input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white relative">
              <FaFingerprint className="text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
                required
              />
              {showPassword ? (
                <FaEye
                  className="absolute right-3 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <FaEyeSlash
                  className="absolute right-3 cursor-pointer text-gray-500"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            {/* Strength meter */}
            {password && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="w-full h-2 rounded bg-gray-200">
                  <div
                    className="h-2 rounded transition-all"
                    style={{
                      width: `${(score + 1) * 20}%`,
                      backgroundColor:
                        score < 2
                          ? "red"
                          : score === 2
                          ? "orange"
                          : score === 3
                          ? "yellowgreen"
                          : "green",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  {score < 2
                    ? "Weak password"
                    : score === 2
                    ? "Fair password"
                    : score === 3
                    ? "Good password"
                    : "Strong password"}
                </p>
                {feedback.length > 0 && (
                  <ul className="text-xs text-gray-500 list-disc pl-4">
                    {feedback.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white relative">
            <FaFingerprint className="text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-lg mt-2 hover:bg-green-700 font-medium"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

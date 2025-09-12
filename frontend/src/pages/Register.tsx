import { useState, useEffect } from "react";
import { MdEmail, MdPhone } from "react-icons/md";
import {
  FaFingerprint,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    password: "",
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState<string>("Loading terms...");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("pendingEmail", formData.email);
      navigate("/verify-email");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load terms text once when modal is opened
  useEffect(() => {
    if (showTerms) {
      fetch("/terms.md") // or terms.md placed in public/ or src/assets/
        .then((res) => res.text())
        .then((text) => setTermsText(text))
        .catch(() =>
          setTermsText("Failed to load terms. Please try again later.")
        );
    }
  }, [showTerms]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm md:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        <img src="./public/vite.svg" alt="Logo" className="w-12 md:w-14" />
        <h1 className="text-lg md:text-xl font-semibold">Create an Account</h1>
        <p className="text-xs md:text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-white cursor-pointer"
          >
            Login
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3 mt-2"
        >
          {/* Name */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <FaUser className="text-white" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
              required
            />
          </div>

          {/* Email */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <MdEmail className="text-white" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
              required
            />
          </div>

          {/* Phone */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <MdPhone className="text-white" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
              required
            />
          </div>

          {/* Organization */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <FaBuilding className="text-white" />
            <input
              type="text"
              name="organization"
              placeholder="Organization"
              value={formData.organization}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
            />
          </div>

          {/* Password */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2 relative">
            <FaFingerprint className="text-white" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
              required
            />
            {showPassword ? (
              <FaEye
                className="absolute right-5 cursor-pointer text-white"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <FaEyeSlash
                className="absolute right-5 cursor-pointer text-white"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              className="cursor-pointer"
            />
            <span>
              I accept the terms and conditions{" "}
              <span
                className="text-blue-400 cursor-pointer underline"
                onClick={() => setShowTerms(true)}
              >
                Read terms and agreements
              </span>
            </span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className={`w-full p-2 rounded-xl mt-3 text-sm md:text-base ${
              !acceptTerms || loading
                ? "bg-green-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Back to Login Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full p-2 bg-gray-700 rounded-xl mt-3 hover:bg-gray-600 text-sm md:text-base"
        >
          Back to Login
        </button>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[90%] max-w-md text-white relative">
            <h2 className="text-lg font-bold mb-3">Terms and Agreements</h2>
            <div className="text-sm text-gray-300 mb-4 max-h-60 overflow-y-auto whitespace-pre-wrap">
              {termsText}
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

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
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
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
      fetch("/terms.md")
        .then((res) => res.text())
        .then((text) => setTermsText(text))
        .catch(() =>
          setTermsText("Failed to load terms. Please try again later.")
        );
    }
  }, [showTerms]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-[90%] max-w-sm md:max-w-md p-8 bg-white flex-col flex items-center gap-5 rounded-xl shadow-lg border border-gray-200">
        {/* Logo */}
        <img
          src="/StegoEnterprise_MAIN_Logo.png"
          alt="StegoEnterprise Logo"
          className="w-48 md:w-56 mb-2"
        />

        <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
        <p className="text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-green-600 cursor-pointer font-medium hover:underline"
          >
            Login
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 mt-3"
        >
          {/* Name */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <FaUser className="text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

          {/* Email */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <MdEmail className="text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

          {/* Phone */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <MdPhone className="text-gray-500" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

          {/* Organization */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <FaBuilding className="text-gray-500" />
            <input
              type="text"
              name="organization"
              placeholder="Organization"
              value={formData.organization}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
            />
          </div>

          {/* Password */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white relative">
            <FaFingerprint className="text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white relative">
            <FaFingerprint className="text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-gray-900 ml-2"
              required
            />
          </div>

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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className={`w-full p-3 rounded-lg mt-3 font-medium text-white ${
              !acceptTerms || loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Back to Login Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full p-3 border border-gray-300 rounded-lg mt-3 hover:bg-gray-100 text-sm md:text-base text-gray-700 font-medium"
        >
          Back to Login
        </button>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md text-gray-800 relative shadow-lg">
            <h2 className="text-lg font-bold mb-3">Terms and Agreements</h2>
            <div className="text-sm text-gray-700 mb-4 max-h-60 overflow-y-auto whitespace-pre-wrap">
              {termsText}
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
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

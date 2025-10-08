// src/pages/Login.tsx
import { MdEmail } from "react-icons/md";
import { FaFingerprint, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import API from "../api/api";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // ------------------ Handle Local Login ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isAdmin", res.data.user.isAdmin ? "true" : "false"); // ✅ save role
        if (res.data.user.isAdmin) navigate("/admin");
        else navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/register");
  };

  // ------------------ Google Login ------------------
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const backendRes = await API.post("/auth/google", {
          email: res.data.email,
          name: res.data.name,
          picture: res.data.picture,
        });

        localStorage.setItem("token", backendRes.data.token);

        if (backendRes.data.user.needsProfileCompletion) navigate("/google-onboarding");
        else if (backendRes.data.user.isAdmin) navigate("/admin");
        else navigate("/dashboard");
      } catch (err) {
        console.error("Google login failed:", err);
        setError("Google login failed");
      }
    },
    onError: () => setError("Google login failed"),
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="w-[90%] max-w-sm md:max-w-md p-8 bg-white flex-col flex items-center gap-5 rounded-xl shadow-lg border border-gray-200">


        {/* Logo */}
        <img
          src="/Wet-Stone-Logo-Black.png"
          alt="Wetstone Logo"
          className="w-48 md:w-56 mb-2"
        />

        <img
          src="/StegoEnterprise_MAIN_Logo.png"
          alt="StegoEnterprise Logo"
          className="w-48 md:w-56 mb-2"
        />



        <h2 className="text-2xl font-bold text-gray-900">Sign in to StegoEnterprise</h2>

        <p className="text-sm text-gray-500 text-center">
          Don’t have an account?{" "}
          <span
            onClick={handleSubmitRegister}
            className="text-green-600 cursor-pointer font-medium hover:underline"
          >
            Sign up
          </span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-3">
          {/* Email */}
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

          {/* Password */}
          <div className="w-full flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white relative">
            <FaFingerprint className="text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-lg mt-2 hover:bg-green-700 font-medium"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

            <p className="text-sm text-gray-500 text-center mt-3">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              Forgot your password?
            </span>
          </p>

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center py-3">
          <div className="w-2/5 h-[1px] bg-gray-300"></div>
          <h3 className="text-xs md:text-sm px-3 text-gray-400">Or</h3>
          <div className="w-2/5 h-[1px] bg-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="relative w-full">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full p-3 bg-gray-100 border border-gray-300 text-gray-700 cursor-pointer rounded-lg hover:bg-gray-200 font-medium"
          >
            <FaGoogle className="text-lg md:text-xl text-red-500" />
            <span className="text-sm md:text-base">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

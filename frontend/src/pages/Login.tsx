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

        // ✅ Check if user is admin
        if (res.data.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Handle Register Navigation ------------------
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

        // ✅ Redirect admin vs normal user
        if (backendRes.data.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
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
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-sm md:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-slate-500 shadow-lg">
        {/* Logo */}
        <img src="./public/vite.svg" alt="Logo" className="w-12 md:w-14" />
        <h1 className="text-lg md:text-xl font-semibold">Welcome to Stego</h1>
        <p className="text-xs md:text-sm text-gray-500 text-center">
          Dont have an Account?{" "}
          <span onClick={handleSubmitRegister} className="text-white cursor-pointer">
            Sign up
          </span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-2">
          {/* Email */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <MdEmail className="text-white" />
            <input
              type="email"
              placeholder="Email account"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 w-full outline-none text-sm md:text-base text-white"
              required
            />
          </div>

          {/* Password */}
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2 relative">
            <FaFingerprint className="text-white" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-green-500 rounded-xl mt-3 hover:bg-green-600 text-sm md:text-base"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative w-full flex items-center justify-center py-3">
          <div className="w-2/3 h-[2px] bg-gray-800"></div>
          <h3 className="text-xs md:text-sm px-4 text-gray-500">Or</h3>
          <div className="w-2/3 h-[2px] bg-gray-800"></div>
        </div>

        {/* Google Only Button (stretched full width) */}
        <div className="relative w-full py-3">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 w-full p-3 bg-slate-600 cursor-pointer rounded-xl hover:bg-slate-700"
          >
            <FaGoogle className="text-lg md:text-xl" />
            <span className="text-sm md:text-base">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

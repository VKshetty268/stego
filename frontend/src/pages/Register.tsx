import { useState } from "react";
import { MdEmail, MdPhone } from "react-icons/md";
import { FaFingerprint, FaBuilding } from "react-icons/fa";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
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

      navigate("/dashboard"); // redirect on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-green-500 rounded-xl mt-3 hover:bg-green-600 text-sm md:text-base"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

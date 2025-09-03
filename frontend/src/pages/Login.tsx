// src/pages/Login.tsx
// import React, { useState } from "react";
// import API from "../api/api";
// import { useNavigate } from "react-router-dom";

import { MdEmail } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault(); // stop form refresh
  navigate("/dashboard"); // go to dashboard
};

const handleSubmitRegister = (e: React.FormEvent) => {
  e.preventDefault(); // stop form refresh
  navigate("/register"); // go to register
};


  //   const handleSubmit = async (e: React.FormEvent) => {
  //   // e.preventDefault();
  //   // setError(null);
  //   // setLoading(true);
  //     console.log("Testing")
      
  //   // try {
  //   //   const res = await fetch("http://localhost:4000/api/auth/login", {
  //   //     method: "POST",
  //   //     headers: { "Content-Type": "application/json" },
  //   //     credentials: "include", // important for session cookie
  //   //     body: JSON.stringify({ email, password }),
  //   //   });

  //   //   if (!res.ok) {
  //   //     const data = await res.json();
  //   //     throw new Error(data.error || "Login failed");
  //   //   }

  //   //   // login successful → go to dashboard
  //   //   navigate("/dashboard");
  //   // } catch (err: any) {
  //   //   setError(err.message);
  //   // } finally {
  //   //   setLoading(false);
  //   // }
  //   navigate("/Dashboard");
  // };

  return (

    <div className="w-full h-screen flex items-center justify-center">

      <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl 
                      shadow-slate-500 shadow-lg font-200">
                        <img src="./public/vite.svg" alt="Logo" className="w-12 md:w-14 " />
                        <h1 className="text-lg md:text-x1 font-semibold"> Welcome to Stego</h1>
                        <p className="text-xs md:text-sm text-gray-500 text-center"> Dont have an Account?
                          <span onClick={handleSubmitRegister}  className="text-white cursor-pointer"> Sign up</span>
                        </p>

        <div className="w-full flex flex-col gap-3">
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2">
            <MdEmail className="text-white"></MdEmail>
            <input type="email" placeholder="Email account" className="bg-transparent border-0 w-full outline-none
                                                text-sm md:text-base text-white"/>
          </div>
          <div className="w-full flex items-center bg-gray-800 p-2 rounded-xl gap-2 relative">
            <FaFingerprint className="text-white"/>
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="bg-transparent border-0 w-full outline-none
                                                text-sm md:text-base text-white"/>
            {showPassword ? (<FaEye className="absolute right-5 cursor-pointer text-white" onClick={togglePasswordVisibility} />) :
              (<FaEyeSlash className="absolute right-5 cursor-pointer text-white" onClick={togglePasswordVisibility} />)}
          </div>
        </div>

        <button  onClick={handleSubmit} className="w-full p-2 bg-green-500 rounded-xl mt-3 hover:bg-green-600 text-sm md:text-base">Login</button>

          <div className="relative w-full flex item-center justify-center py-3">
            <div className="w-2/3 h-[2px] bg-gray-800"></div>
            <h3 className="text-xs md:text-sm px-4 text-gray-500">Or</h3> 
            <div className="w-2/3 h-[2px] bg-gray-800"></div>
          </div>

        <div className="relative w-full flex items-center justify-between py-3">
          <div className="p-2 md:px-10 bg-slate-600 cursor-pointer rounded-xl hover:bg-slate-700">
            <FaGoogle className="text-lg md:text-xl"></FaGoogle>
          </div>
          <div className="p-2 md:px-10 bg-slate-600 cursor-pointer rounded-xl hover:bg-slate-700">
            <MdEmail className="text-lg md:text-xl"></MdEmail>
          </div>
          <div className="p-2 md:px-10 bg-slate-600 cursor-pointer rounded-xl hover:bg-slate-700">
            <FaApple className="text-lg md:text-xl"></FaApple>
          </div>
        </div>
      </div>

    </div>

  )
}

export default Login


// const Login: React.FC = () => {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const navigate = useNavigate();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await API.post("/auth/login", form);
//       localStorage.setItem("token", res.data.token);
//       navigate("/dashboard");
//     } catch (err: any) {
//       alert("Login failed!");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Login</h2>
//       <input name="email" placeholder="Email" onChange={handleChange} /><br/>
//       <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br/>
//       <button type="submit">Login</button>
//     </form>
//   );
// };

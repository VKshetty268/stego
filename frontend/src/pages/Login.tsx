// src/pages/Login.tsx
import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      alert("Login failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="email" placeholder="Email" onChange={handleChange} /><br/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br/>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;

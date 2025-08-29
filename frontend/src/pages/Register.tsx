// src/pages/Register.tsx
import React, { useState } from "react";
import API from "../api/api";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    website: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} /><br/>
      <input name="email" placeholder="Email" onChange={handleChange} /><br/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br/>
      <input name="company" placeholder="Company" onChange={handleChange} /><br/>
      <input name="website" placeholder="Website" onChange={handleChange} /><br/>
      <input name="phone" placeholder="Phone" onChange={handleChange} /><br/>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;

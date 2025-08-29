import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      <Link to="/">Home</Link> |{" "}
      <Link to="/register">Register</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/dashboard">Dashboard</Link>
      <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;

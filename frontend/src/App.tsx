// src/App.tsx
import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import './index.css';


const App: React.FC = () => {
  return (
    <div className="w-full">
    <Login/>
    </div>
  );
};

export default App;

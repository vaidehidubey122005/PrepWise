// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Interview from "./pages/Interview"; // ✅ Interview page
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<Route path="/interview" element={<Interview />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./Dashboard"; // ✅ Import added
import About from "./components/About";
import SalaryDashboard from "./components/SalaryDashboard";
import Savings from "./components/Savings"; 

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} /> {/* ✅ Fix added */}
        <Route path="/about" element={<About />} />
          <Route path="/salary" element={<SalaryDashboard />} />
          <Route path="/savings" element={user ? <Savings /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;


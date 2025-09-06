import React, { useContext, useEffect, useState } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

import "chart.js/auto";

function MainApp() {
  const { user } = useContext(AuthContext);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 2000);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 750);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🚫 Show message if screen is too small
  if (!isLargeScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-6 text-center">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Screen Too Small
          </h1>
          <p className="text-gray-700">
            This site is only available on large screens (2000px and above).
            Please view it on a bigger display.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 p-4 space-y-8 md:space-y-0 md:space-x-8">
        <Register />
        <Login />
      </div>
    );
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

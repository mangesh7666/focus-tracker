import React, { useContext, useState, useEffect } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function MainApp() {
  const { user } = useContext(AuthContext);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Function to check screen size
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 750);
    };

    checkScreenSize(); // run on first load
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isSmallScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Screen Too Small</h1>
          <p className="text-gray-600">
            This site is only available on screens 750px and above.  
            Please use a larger display.
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

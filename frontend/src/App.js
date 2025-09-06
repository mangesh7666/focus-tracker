import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

import "chart.js/auto";

// Original Code
// import React, { useContext } from "react";
// import { AuthProvider, AuthContext } from "./context/AuthContext";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import Dashboard from "./components/Dashboard";
// import "./components/chartSetup";
//
// function MainApp() {
//   const { user } = useContext(AuthContext);
//
//   if (!user) {
//     return (
//       <div>
//         <Register />
//         <Login />
//       </div>
//     );
//   }
//
//   return <Dashboard />;
// }
//
// export default function App() {
//   return (
//     <AuthProvider>
//       <MainApp />
//     </AuthProvider>
//   );
// }

// Corrected and Updated Code
function MainApp() {
  const { user } = useContext(AuthContext);

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

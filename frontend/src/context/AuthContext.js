import React, { createContext, useState } from "react";

// Original Code
// import React, { createContext, useState } from "react";
//
// export const AuthContext = createContext();
//
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
//
//   const login = (data) => {
//     localStorage.setItem("jwtToken", data.token);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     setUser(data.user);
//   };
//
//   const logout = () => {
//     localStorage.removeItem("jwtToken");
//     localStorage.removeItem("user");
//     setUser(null);
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// Corrected and Updated Code
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });

  const login = (data) => {
    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

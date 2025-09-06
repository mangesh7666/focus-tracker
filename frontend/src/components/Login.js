import React, { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

// Original Code
// import React, { useState, useContext } from "react";
// import API from "../api";
// import { AuthContext } from "../context/AuthContext";
//
// export default function Login() {
//   const { login } = useContext(AuthContext);
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState(null);
//
//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       // Clear any previous errors
//       setError(null);
//       const res = await API.post("/auth/login", form);
//       // The login function in AuthContext will handle storing the token and user
//       login(res.data);
//     } catch (err) {
//       console.error("Login failed:", err.response ? err.response.data : err.message);
//       setError(err.response?.data?.message || "An error occurred during login.");
//     }
//   };
//
//   return (
//     <form onSubmit={submit}>
//       <h2>Login</h2>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <input
//         placeholder="Email"
//         onChange={(e) => setForm({ ...form, email: e.target.value })}
//         value={form.email}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setForm({ ...form, password: e.target.value })}
//         value={form.password}
//       />
//       <button type="submit">Login</button>
//     </form>
//   );
// }

// Corrected and Updated Code
export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await API.post("/auth/login", form);
      login(res.data);
    } catch (err) {
      console.error("Login failed:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "An error occurred during login.");
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Login</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          value={form.email}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          value={form.password}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Login
        </button>
      </div>
    </form>
  );
}

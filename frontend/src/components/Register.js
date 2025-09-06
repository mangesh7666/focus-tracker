import React, { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";


// Corrected and Updated Code
export default function Register() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await API.post("/api/auth/register", form);
      login(res.data);
    } catch (err) {
      console.error("Registration failed:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "An error occurred during registration.");
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Register</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          value={form.name}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
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
          Sign Up
        </button>
      </div>
    </form>
  );
}

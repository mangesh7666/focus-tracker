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

    <>

    <section className="py-10 px-6 md:px-20 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Setup Chrome Extension from GitHub
        </h2>

        <p className="text-lg text-center mb-8">
          You can install the extension manually from my GitHub repository.  
          Just follow the steps below 👇
        </p>

        <div className="space-y-6">
          <ol className="list-decimal list-inside space-y-4 text-base md:text-lg">
            <li>
              <strong>Download the Code:</strong>  
              Visit{" "}
              <a
                href="https://github.com/mangesh7666/focus-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                my GitHub repository
              </a>{" "}
              and either:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Click <em>Code → Download ZIP</em>, then extract it.</li>
                <li>
                  Or clone it using:  
                  <code className="bg-gray-200 px-2 py-1 rounded text-sm block mt-1">
                    git clone https://github.com/mangesh7666/chrome-extension.git
                  </code>
                </li>
              </ul>
            </li>

            <li>
              <strong>Open Extensions Page:</strong>  
              In Chrome, go to{" "}
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                chrome://extensions/
              </code>
              .
            </li>

            <li>
              <strong>Enable Developer Mode:</strong>  
              Toggle the switch at the top right corner.
            </li>

            <li>
              <strong>Load the Extension:</strong>  
              Click{" "}
              <span className="font-medium bg-yellow-100 px-2 py-1 rounded">
                Load unpacked
              </span>{" "}
              and select the folder where the extension code is located (the one with{" "}
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                manifest.json
              </code>
              ).
            </li>

            <li>
              <strong>Done!</strong>  
              The extension will now appear in your extensions list. You can pin it for quick access.
            </li>
          </ol>

          <div className="mt-6 bg-white shadow-md rounded-lg p-4 md:p-6">
            <h3 className="text-xl font-semibold mb-3">Notes</h3>
            <ul className="list-disc list-inside space-y-2 text-base">
              <li>Make sure <code>manifest.json</code> is in the root of the repo folder.</li>
              <li>Reload the extension from <em>chrome://extensions/</em> after changes.</li>
              <li>Check the Chrome console (<kbd>Ctrl+Shift+I</kbd>) if something breaks.</li>
              <li className="text-red-600 font-semibold">
                ⚠️ Without loading the Chrome extension, the site will still open but no data will be shown.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    
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
          className="w-full px-4 py-3 bg-indigo-600 text-dark font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Sign Up
        </button>
      </div>
    </form>
            </>
  );
}

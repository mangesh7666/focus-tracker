/*import React, { useState, useEffect } from "react";
import API from "../api";
import { Trash2 } from 'lucide-react';

// Original Code
// import React, { useState, useEffect } from "react";
// import API from "../api";
//
// export default function Settings() {
//   const [customSites, setCustomSites] = useState([]);
//   const [newSite, setNewSite] = useState('');
//   const [newLimit, setNewLimit] = useState(60);
//   const [unfreezeDuration, setUnfreezeDuration] = useState(15);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         const res = await API.get("/settings");
//         setCustomSites(res.data.customSiteLimits || []);
//         setUnfreezeDuration(res.data.unfreezeDurationMinutes || 15);
//       } catch (err) {
//         console.error("Error fetching settings:", err);
//         setError("Failed to load settings.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSettings();
//   }, []);
//
//   const handleAddSite = async () => {
//     if (!newSite || !newLimit) return;
//     try {
//       const res = await API.put("/settings/custom-sites", { site: newSite, dailyLimitMinutes: newLimit });
//       setCustomSites(res.data);
//       setNewSite('');
//       setNewLimit(60);
//     } catch (err) {
//       setError("Failed to add site.");
//     }
//   };
//
//   const handleDeleteSite = async (site) => {
//     try {
//       await API.delete(`/settings/custom-sites/${site}`);
//       setCustomSites(customSites.filter(s => s.site !== site));
//     } catch (err) {
//       setError("Failed to delete site.");
//     }
//   };
//   
//   const handleUnfreezeDurationChange = async () => {
//     try {
//       await API.put("/settings", { unfreezeDurationMinutes: unfreezeDuration });
//       alert("Unfreeze duration saved!");
//     } catch (err) {
//       setError("Failed to save unfreeze duration.");
//     }
//   };
//
//   if (loading) return <div>Loading settings...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;
//
//   return (
//     <div>
//       <h3>Custom Site Limits</h3>
//       <div>
//         <input
//           type="text"
//           value={newSite}
//           onChange={(e) => setNewSite(e.target.value)}
//           placeholder="e.g., facebook.com"
//         />
//         <input
//           type="number"
//           value={newLimit}
//           onChange={(e) => setNewLimit(+e.target.value)}
//           min="1"
//         />
//         <button onClick={handleAddSite}>Add Site</button>
//       </div>
//       <ul>
//         {customSites.map((item, index) => (
//           <li key={index}>
//             {item.site}: {item.dailyLimitMinutes} minutes
//             <button onClick={() => handleDeleteSite(item.site)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//
//       <h3>Unfreeze Duration</h3>
//       <div>
//         <label>Time to wait after limit is reached (minutes):</label>
//         <input
//           type="number"
//           value={unfreezeDuration}
//           onChange={(e) => setUnfreezeDuration(+e.target.value)}
//           min="1"
//         />
//         <button onClick={handleUnfreezeDurationChange}>Save</button>
//       </div>
//     </div>
//   );
// }


// Corrected and Updated Code
export default function Settings() {
  const [customSites, setCustomSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [newLimit, setNewLimit] = useState(60);
  const [unfreezeDuration, setUnfreezeDuration] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        setCustomSites(res.data.customSiteLimits || []);
        setUnfreezeDuration(res.data.unfreezeDurationMinutes || 15);
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddSite = async () => {
    if (!newSite || !newLimit) {
      setError("Site and limit are required.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await API.put("/settings/custom-sites", { site: newSite, dailyLimitMinutes: newLimit });
      setCustomSites(res.data);
      setNewSite('');
      setNewLimit(60);
      setSuccessMessage("Site limit added successfully!");
    } catch (err) {
      setError("Failed to add site.");
    }
  };

  const handleDeleteSite = async (site) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await API.delete(`/settings/custom-sites/${site}`);
      setCustomSites(customSites.filter(s => s.site !== site));
      setSuccessMessage("Site limit removed.");
    } catch (err) {
      setError("Failed to delete site.");
    }
  };
  
  const handleUnfreezeDurationChange = async () => {
    setError(null);
    setSuccessMessage(null);
    if (unfreezeDuration <= 0) {
      setError("Unfreeze duration must be a positive number.");
      return;
    }
    try {
      await API.put("/settings", { unfreezeDurationMinutes: unfreezeDuration });
      setSuccessMessage("Unfreeze duration saved!");
    } catch (err) {
      setError("Failed to save unfreeze duration.");
    }
  };

  if (loading) return <div className="text-center py-4">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Settings</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg" role="alert">
          {successMessage}
        </div>
      )}

     
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h4 className="text-lg font-medium mb-3">Custom Site Limits</h4>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <input
            type="text"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            placeholder="e.g., facebook.com"
            className="flex-grow px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(+e.target.value)}
            min="1"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleAddSite} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300">
            Add Site
          </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {customSites.map((item, index) => (
            <li key={index} className="flex justify-between items-center py-2">
              <span className="text-gray-700">
                <span className="font-medium">{item.site}</span>: {item.dailyLimitMinutes} minutes
              </span>
              <button onClick={() => handleDeleteSite(item.site)} className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors duration-200">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h4 className="text-lg font-medium mb-3">Unfreeze Duration</h4>
        <h4 className="text-lg font-medium mb-3">Unfreeze Duration must be more than 1 hour (60 min)</h4>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700 text-sm">Time to wait after limit is reached (minutes):</label>
          <input
            type="number"
            value={unfreezeDuration}
            onChange={(e) => {
    const val = +e.target.value;
    if (val >= 61) {
      setUnfreezeDuration(val);
    }
  }}
  min="61"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleUnfreezeDurationChange} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}*/



//designed code 






import React, { useState, useEffect } from "react";
import API from "../api";
import { Trash2 } from "lucide-react";

export default function Settings() {
  const [customSites, setCustomSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [newLimit, setNewLimit] = useState(60);
  const [unfreezeDuration, setUnfreezeDuration] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        setCustomSites(res.data.customSiteLimits || []);
        setUnfreezeDuration(res.data.unfreezeDurationMinutes || 15);
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddSite = async () => {
    if (!newSite || !newLimit) {
      setError("Site and limit are required.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await API.put("/settings/custom-sites", {
        site: newSite,
        dailyLimitMinutes: newLimit,
      });
      setCustomSites(res.data);
      setNewSite("");
      setNewLimit(60);
      setSuccessMessage("Site limit added successfully!");
    } catch (err) {
      setError("Failed to add site.");
    }
  };

  const handleDeleteSite = async (site) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await API.delete(`/settings/custom-sites/${site}`);
      setCustomSites(customSites.filter((s) => s.site !== site));
      setSuccessMessage("Site limit removed.");
    } catch (err) {
      setError("Failed to delete site.");
    }
  };

  const handleUnfreezeDurationChange = async () => {
    setError(null);
    setSuccessMessage(null);
    if (unfreezeDuration <= 0) {
      setError("Unfreeze duration must be a positive number.");
      return;
    }
    try {
      await API.put("/settings", { unfreezeDurationMinutes: unfreezeDuration });
      setSuccessMessage("Unfreeze duration saved!");
    } catch (err) {
      setError("Failed to save unfreeze duration.");
    }
  };

  if (loading) return <div className="text-center py-4">Loading settings...</div>;

  return (
    <div className="container">
      <h3 className="mb-4">Settings</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}

      {/* Custom Site Limits Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Custom Site Limits</h5>
          <div className="row g-2 mb-3">
            <div className="col-sm-6 col-md-5">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                placeholder="e.g., facebook.com"
                className="form-control"
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(+e.target.value)}
                min="1"
                className="form-control"
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <button onClick={handleAddSite} className="btn btn-primary w-100">
                Add Site
              </button>
            </div>
          </div>

          <ul className="list-group">
            {customSites.map((item, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{item.site}</strong>: {item.dailyLimitMinutes} minutes
                </span>
                <button
                  onClick={() => handleDeleteSite(item.site)}
                  className="btn btn-outline-danger btn-sm"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Unfreeze Duration Section */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Unfreeze Duration</h5>
          <p className="text-muted">
            Unfreeze Duration must be more than 1 hour (60 min)
          </p>
          <div className="d-flex align-items-center gap-2">
            <label className="form-label me-2">
              Time to wait after limit is reached (minutes):
            </label>
            <input
              type="number"
              value={unfreezeDuration}
              onChange={(e) => {
                const val = +e.target.value;
                if (val >= 0) {
                  setUnfreezeDuration(val);
                }
              }}
              min="61"
              className="form-control w-auto"
            />
            <button
              onClick={handleUnfreezeDurationChange}
              className="btn btn-success"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



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
        const res = await API.get("/api/settings");
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
      const res = await API.put("/api/settings/custom-sites", {
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
      await API.put("/api/settings", { unfreezeDurationMinutes: unfreezeDuration });
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


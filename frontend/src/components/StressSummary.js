import React, { useState, useEffect } from "react";
import axios from 'axios';
import API from "../api";

const StressSummary = () => {
  const [stressData, setStressData] = useState({
    avgStress: 0,
    maxStress: 0,
    minStress: 0,
    totalSessions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStressData = async () => {
      // Get the token from local storage or wherever you store it
      const token = localStorage.getItem('jwtToken'); // Replace 'userToken' with your token key

      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          },
        };

        // Make sure to update this URL to your actual backend endpoint
        const response = await API.get("/fetch/stress-summary", config);
        setStressData(response.data);
      } catch (err) {
        console.error("Error fetching stress data:", err);
        setError("Failed to load stress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStressData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center my-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      {/* Average Stress Card */}
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm h-100 border-0">
          <div className="card-body d-flex flex-column justify-content-center">
            <p className="text-muted mb-1 fs-6">Avg Stress</p>
            <h5 className="fw-bold display-6 text-primary">{stressData.avgStress}</h5>
          </div>
        </div>
      </div>

      {/* Maximum Stress Card */}
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm h-100 border-0">
          <div className="card-body d-flex flex-column justify-content-center">
            <p className="text-muted mb-1 fs-6">Max Stress</p>
            <h5 className="fw-bold display-6 text-danger">{stressData.maxStress}</h5>
          </div>
        </div>
      </div>

      {/* Minimum Stress Card */}
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm h-100 border-0">
          <div className="card-body d-flex flex-column justify-content-center">
            <p className="text-muted mb-1 fs-6">Min Stress</p>
            <h5 className="fw-bold display-6 text-success">{stressData.minStress}</h5>
          </div>
        </div>
      </div>

      {/* Total Records Card */}
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm h-100 border-0">
          <div className="card-body d-flex flex-column justify-content-center">
            <p className="text-muted mb-1 fs-6">Total Records</p>
            <h5 className="fw-bold display-6 text-info">{stressData.totalSessions}</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StressSummary;
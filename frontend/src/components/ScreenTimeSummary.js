import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance

const ScreenTimeSummary = () => {
  const [summary, setSummary] = useState({
    totalTime: 0,
    sitesVisited: 0,
    longestSession: 0,
    avgSession: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await API.get("/fetch/screen-time-summary", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // res.data expected format:
        // { totalTime: 180, sitesVisited: 5, longestSession: 60, avgSession: 20 }
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching screen time summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <p>Loading summary...</p>;
  }

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <p className="text-muted">Total Time</p>
            <h5 className="fw-bold">{summary.totalTime} min</h5>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <p className="text-muted">Sites Visited</p>
            <h5 className="fw-bold">{summary.sitesVisited}</h5>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <p className="text-muted">Longest Session</p>
            <h5 className="fw-bold">{summary.longestSession} min</h5>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <p className="text-muted">Avg Session</p>
            <h5 className="fw-bold">{summary.avgSession} min</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenTimeSummary;

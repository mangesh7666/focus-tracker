import React, { useEffect, useState } from "react";
import API from "../api"; // your axios instance

const ScreenTimeTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await API.get("/fetch/screen-time-records", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Expected format from backend:
        // [{ site: "YouTube", time: 120, sessions: 6 }, ...]
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching screen time records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <p>Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
  <div className="card-body">
    <h5 className="card-title mb-3">Screen Time Records</h5>
    <div
      className="table-responsive"
      style={{ maxHeight: "300px", overflowY: "auto" }}
    >
      <table className="table table-striped table-bordered align-middle mb-0">
        <thead
          className="table-light"
          style={{ 
            position: "sticky", 
            top: 0, 
            zIndex: 1, 
            backgroundColor: "#f8f9fa" 
          }}
        >
          <tr>
            <th>Site</th>
            <th>Total Time (min)</th>
            <th>Sessions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td>{r.site}</td>
              <td>{r.time}</td>
              <td>{r.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


  );
};

export default ScreenTimeTable;

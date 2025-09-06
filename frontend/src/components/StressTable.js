import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";

const StressTable = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await API.get("/fetch/stress-logs1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching stress logs:", err);
      }
    };

    fetchLogs();
  }, []);

  return (
   <div className="card shadow-sm">
  <div className="card-body">
    <h5 className="card-title mb-3">Stress Records</h5>
    <div
      className="table-responsive"
      style={{ maxHeight: "300px", overflowY: "auto" }}
    >
      <table className="table table-striped table-bordered align-middle mb-0">
        <thead
          className="table-light"
          style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#f8f9fa" }}
        >
          <tr>
            <th>Date</th>
            <th>Level</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                No records found
              </td>
            </tr>
          ) : (
            records.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.level}</td>
                <td>{r.method}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
  );
};

export default StressTable;

import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const StressChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("authToken"); // or however you store it
        const res = await API.get("/fetch/stress-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Error fetching stress logs:", err);
      }
    };

    fetchLogs();
  }, []);

  return (
   <div className="card shadow-sm mb-4">
  <div className="card-body" style={{ height: "300px" }}>
    <h5 className="card-title mb-3">Stress Trend</h5>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007bff" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#007bff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" />
        <YAxis domain={[0, 1]} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area type="monotone" dataKey="level" stroke="none" fill="url(#stressGradient)" />
        <Line type="monotone" dataKey="level" stroke="#007bff" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>
  );
};

export default StressChart;

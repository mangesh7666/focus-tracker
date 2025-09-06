// src/components/ScreenTimeFilterControls.js
import React, { useState, useEffect } from "react";
import API from "../api";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- Helper Function for Time Formatting ---
const formatTime = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return '—';
  }
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  return `${Math.round(minutes)}m`;
};

// --- Table Component ---
const ScreenTimeTable = ({ records }) => (
  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <table className="table table-striped">
      <thead style={{ position: 'sticky', top: '0', backgroundColor: '#fff' }}>
        <tr>
          <th>Date</th>
          <th>Site</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={index}>
            <td>{record.date ? new Date(record.date).toLocaleDateString() : '—'}</td>
            <td>{record.site}</td>
            <td>{formatTime(record.time)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Utility: Group records by date with per-site values ---
const groupRecordsByDate = (records) => {
  const grouped = records.reduce((acc, r) => {
    if (!r.date || typeof r.time !== 'number' || isNaN(r.time)) return acc;
    const date = new Date(r.date).toLocaleDateString();
    if (!acc[date]) acc[date] = { date };
    acc[date][r.site] = (acc[date][r.site] || 0) + Math.round(r.time);
    return acc;
  }, {});
  return Object.values(grouped);
};

const extractSites = (records) => [...new Set(records.map(r => r.site))];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a284d8', '#0088FE', '#00C49F'];

// --- Bar Chart ---
const ScreenTimeBarChart = ({ records }) => {
  const data = groupRecordsByDate(records);
  const sites = extractSites(records);
  if (data.length === 0) return <p className="text-center mt-4 text-muted">No valid data to display.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatTime} />
        <Tooltip formatter={(value) => formatTime(value)} />
        <Legend />
        {sites.map((site, i) => (
          <Bar key={site} dataKey={site} stackId="a" fill={COLORS[i % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Line Chart ---
const ScreenTimeLineChart = ({ records }) => {
  const data = groupRecordsByDate(records);
  const sites = extractSites(records);
  if (data.length === 0) return <p className="text-center mt-4 text-muted">No valid data to display.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatTime} />
        <Tooltip formatter={(value) => formatTime(value)} />
        <Legend />
        {sites.map((site, i) => (
          <Line key={site} type="monotone" dataKey={site} stroke={COLORS[i % COLORS.length]} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- Area Chart ---
const ScreenTimeAreaChart = ({ records }) => {
  const data = groupRecordsByDate(records);
  const sites = extractSites(records);
  if (data.length === 0) return <p className="text-center mt-4 text-muted">No valid data to display.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatTime} />
        <Tooltip formatter={(value) => formatTime(value)} />
        <Legend />
        {sites.map((site, i) => (
          <Area key={site} type="monotone" dataKey={site} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} stackId="1" />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// --- Pie Chart (total time per site across all dates) ---
const ScreenTimePieChart = ({ records }) => {
  const siteData = records
    .filter(r => typeof r.time === 'number' && !isNaN(r.time))
    .reduce((acc, curr) => {
      const site = curr.site;
      if (!acc[site]) acc[site] = 0;
      acc[site] += Math.round(curr.time);
      return acc;
    }, {});
  
  const data = Object.keys(siteData).map((site) => ({
    name: site,
    value: siteData[site]
  }));

  if (data.length === 0) return <p className="text-center mt-4 text-muted">No valid data to display.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatTime(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- Main Component ---
const ScreenTimeFilterControls = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("All Time");
  const [chartType, setChartType] = useState("Table");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await API.get("/fetch/screen-time-records1", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(res.data)) {
          console.error("API response is not an array:", res.data);
          setRecords([]); 
          return;
        }
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching screen time records:", err);
        setRecords([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...records];
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (dateFilter === "Today") {
      filtered = filtered.filter(
        (r) => r.date && new Date(r.date).toDateString() === today.toDateString()
      );
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter((r) => r.date && new Date(r.date) >= weekAgo);
    } else if (dateFilter === "Last 30 Days") {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter((r) => r.date && new Date(r.date) >= monthAgo);
    }
    
    setFilteredRecords(filtered);
  }, [records, dateFilter]);

  const renderDisplay = () => {
    if (filteredRecords.length === 0) {
      return (
        <p className="text-center mt-4 text-muted">
          No records found for the selected filters.
        </p>
      );
    }

    switch (chartType) {
      case "Table":
        return <ScreenTimeTable records={filteredRecords} />;
      case "Bar Chart":
        return <ScreenTimeBarChart records={filteredRecords} />;
      case "Line Chart":
        return <ScreenTimeLineChart records={filteredRecords} />;
      case "Area Chart":
        return <ScreenTimeAreaChart records={filteredRecords} />;
      case "Pie Chart":
        return <ScreenTimePieChart records={filteredRecords} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
        <select
          className="form-select w-auto"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option>All Time</option>
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
        <select
          className="form-select w-auto"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option>Table</option>
          <option>Bar Chart</option>
          <option>Line Chart</option>
          <option>Area Chart</option>
          <option>Pie Chart</option>
        </select>
      </div>

      <div className="mt-4">
        <h3>Filtered Screen Time Records</h3>
        {renderDisplay()}
      </div>
    </div>
  );
};

export default ScreenTimeFilterControls;

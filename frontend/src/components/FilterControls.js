// src/components/StressFilterControls.js
import React, { useState, useEffect } from "react";
import API from "../api";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Helper function to parse the date string "YYYY-MM-DD HH:mm"
const parseDate = (dateStr) => {
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

// Component to display stress data in a scrollable table
const StressTable = ({ records }) => (
  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <table className="table table-striped">
      <thead style={{ position: 'sticky', top: '0', backgroundColor: '#fff' }}>
        <tr>
          <th>Date</th>
          <th>Method</th>
          <th>Level</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={index}>
            <td>{record.date}</td>
            <td>{record.method}</td>
            <td>{record.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Component for a Bar Chart using Recharts
const StressBarChart = ({ records }) => {
  const data = records.map(r => ({ date: r.date, level: r.level }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="level" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Component for a Pie Chart using Recharts
const StressPieChart = ({ records }) => {
  const methodData = records.reduce((acc, curr) => {
    const method = curr.method.toLowerCase();
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method]++;
    return acc;
  }, {});
  
  const data = Object.keys(methodData).map(key => ({
    name: key,
    value: methodData[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// New: Component for a Line Chart using Recharts
const StressLineChart = ({ records }) => {
  const data = records.map(r => ({ date: r.date, level: r.level }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="level" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// New: Component for an Area Chart using Recharts
const StressAreaChart = ({ records }) => {
  const data = records.map(r => ({ date: r.date, level: r.level }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="level" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// The main StressFilterControls component
const StressFilterControls = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("All Time");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [chartType, setChartType] = useState("Table");

  // Fetch stress records from the backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await API.get("/api/fetch/stress-logs1", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching stress records:", err);
      }
    };
    fetchData();
  }, []);

  // Filter records whenever state changes
  useEffect(() => {
    let filtered = [...records];
    const today = new Date();

    if (dateFilter === "Today") {
      filtered = filtered.filter(
        (r) => parseDate(r.date).toDateString() === today.toDateString()
      );
    } else if (dateFilter === "Last 7 Days") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter((r) => parseDate(r.date) >= weekAgo);
    } else if (dateFilter === "Last 30 Days") {
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter((r) => parseDate(r.date) >= monthAgo);
    }

    if (methodFilter !== "All Methods") {
      filtered = filtered.filter(
        (r) => r.method.toLowerCase() === methodFilter.toLowerCase()
      );
    }

    setFilteredRecords(filtered);
  }, [records, dateFilter, methodFilter]);

  // Conditional rendering of the display component
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
        return <StressTable records={filteredRecords} />;
      case "Bar Chart":
        return <StressBarChart records={filteredRecords} />;
      case "Pie Chart":
        return <StressPieChart records={filteredRecords} />;
      case "Line Chart":
        return <StressLineChart records={filteredRecords} />;
      case "Area Chart":
        return <StressAreaChart records={filteredRecords} />;
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
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option>All Methods</option>
          <option>Webcam</option>
          <option>Mic</option>
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
        <h3>Filtered Stress Records</h3>
        {renderDisplay()}
      </div>
    </div>
  );
};

export default StressFilterControls;

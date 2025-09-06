import React, { useEffect, useState } from "react";
import API from "../api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Convert decimal minutes to MM:SS string
function formatMinutesSeconds(decimalMinutes) {
  if (decimalMinutes == null || isNaN(decimalMinutes)) return "0:00";
  const totalSeconds = Math.floor(decimalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function normalizeDomain(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

function TimeChart() {
  const [userSettings, setUserSettings] = useState(null);
  const [siteLogs, setSiteLogs] = useState([]);
  const jwtToken = localStorage.getItem("jwtToken");

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching user settings and aggregated logs...");
        const settingsRes = await API.get("/api/settings", {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setUserSettings(settingsRes.data);
        console.log("Settings response:", settingsRes.data);

        const logsRes = await API.get("/api/time/daily-by-site", {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        console.log("Aggregated daily-by-site logs response:", logsRes.data);

        let logs = logsRes.data;

        // Ensure totalMinutes exists and is a number
        logs = logs.map((log) => ({
          ...log,
          totalMinutes: log.totalMinutes || 0,
        }));

        // Optionally filter by user's customSiteLimits if present
        if (
          settingsRes.data?.customSiteLimits &&
          settingsRes.data.customSiteLimits.length > 0
        ) {
          logs = logs.filter((log) => {
            const logDomain = normalizeDomain(log.site);
            return settingsRes.data.customSiteLimits.some(
              (setting) => normalizeDomain(setting.site) === logDomain
            );
          });
        }

        setSiteLogs(logs);
        console.log("Filtered and normalized logs:", logs);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSiteLogs([]);
      }
    }

    if (jwtToken) {
      fetchData();
    } else {
      console.warn("No token found — cannot fetch data");
    }
  }, [jwtToken]);

  const chartData = {
    labels: siteLogs.map((log) => normalizeDomain(log.site)),
    datasets: [
      {
        label: "Time spent (minutes)",
        data: siteLogs.map((log) => parseFloat(log.totalMinutes) || 0),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Total Site Usage (All Time)" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const decimalMinutes = context.parsed.y;
            return `Time: ${formatMinutesSeconds(decimalMinutes)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatMinutesSeconds(value),
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "auto" }}>
      <h2>Total Site Usage</h2>
      {siteLogs.length === 0 ? (
        <p>No usage data available.</p>
      ) : (
        <>
          <Bar options={options} data={chartData} />
          <h3>Usage Details (MM:SS)</h3>
          <ul>
            {siteLogs.map(({ site, totalMinutes }) => (
              <li key={site}>
                {normalizeDomain(site)}: {formatMinutesSeconds(totalMinutes)}
              </li>
            ))}
          </ul>
          <pre style={{ fontSize: 12, background: "#eee", padding: 10 }}>
            {JSON.stringify(siteLogs, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}

export default TimeChart;

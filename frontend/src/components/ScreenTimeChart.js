import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,PieChart, Pie, Cell, Legend
} from "recharts";
import API from "../api";

const ScreenTimeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreenTime = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          console.warn("No auth token found");
          setLoading(false);
          return;
        }

        const res = await API.get("/fetch/screen-time", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data || []);
      } catch (err) {
        console.error("Error fetching screen time:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScreenTime();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <p>Loading screen time...</p>
        </div>
      </div>
    );
  }

const COLORS = ["#28a745", "#198754", "#6c757d", "#ffc107", "#dc3545"];


  return (
    <div className="row g-3 mb-4">
      {/* Vertical Bar Chart */}
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body" style={{ height: "350px" }}>
            <h5 className="card-title mb-3">Screen Time per Site</h5>
            <ResponsiveContainer width="100%" height="100%">
             <BarChart
  data={data}
  margin={{ top: 20, right: 30, left: 20, bottom: 70 }} // more bottom space
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis
    dataKey="site"
    angle={0}        // tilt the labels
    textAnchor="end"   // align text to end
    interval={0}       // show all labels
  />
  <YAxis />
  <Tooltip formatter={(value) => `${value} min`} />
  <Bar
    dataKey="minutes"
    fill="#28a745"
    radius={[10, 10, 0, 0]}
    barSize={30}
  />
</BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body" style={{ height: "350px" }}>
            <h5 className="card-title mb-3">Time Distribution</h5>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="minutes"
                  nameKey="site"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} min`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenTimeChart;

import React, { useEffect, useState } from "react";
import API from "../api";

const TopSites = () => {
  const [topSites, setTopSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSites = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await API.get("/fetch/screen-time", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort sites by total duration (descending) and take top 5
        const sortedSites = res.data
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 5);

        setTopSites(sortedSites);
      } catch (err) {
        console.error("Error fetching top sites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSites();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <p>Loading top sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
        <h5>Most used sites</h5>
      {topSites.map((site, index) => (
        <div className="col-6 col-md-4 col-lg-2" key={index}>
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <p className="text-muted mb-1">{site.site}</p>
              <h5 className="fw-bold">{site.minutes} min</h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopSites;

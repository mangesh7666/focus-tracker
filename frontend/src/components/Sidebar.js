// src/components/Sidebar.js
import React from "react";
import { LogOut } from 'lucide-react';
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";



const Sidebar = ({ onSelect }) => {
    const { user, logout } = useContext(AuthContext);
  return (
    <div className="d-flex flex-column bg-dark text-white vh-100" style={{ width: "250px" }}>
      <div className="p-3 border-bottom border-secondary fs-4 fw-bold">
        Dashboard
      </div>
      <nav className="flex-grow-1 p-3">
        <ul className="nav flex-column gap-2">


          <li className="nav-item">
            <button onClick={() => onSelect("overview")} className="btn btn-link text-white text-start w-100">
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => onSelect("chart")} className="btn btn-link text-white text-start w-100">
              Stress Chart
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => onSelect("summary")} className="btn btn-link text-white text-start w-100">
              Summary
            </button>
          </li>
          <li className="nav-item">
  <button
    onClick={() => onSelect("screenTime")}
    className="btn btn-link text-white text-start w-100"
  >
    Screen Time
  </button>
</li>


 <li className="nav-item">
            <button onClick={() => onSelect("screenchart")} className="btn btn-link text-white text-start w-100">
              Screen time chart
            </button>
          </li>


           <li className="nav-item">
            <button onClick={() => onSelect("screensummary")} className="btn btn-link text-white text-start w-100">
              Screen time summary
            </button>
          </li>


 <li className="nav-item">
            <button onClick={() => onSelect("settings")} className="btn btn-link text-white text-start w-100">
              settings
            </button>
          </li>

           <li className="nav-item">
            <button onClick={() => onSelect("filter")} className="btn btn-link text-white text-start w-100">
              Stress reports
            </button>
          </li>

           <li className="nav-item">
            <button onClick={() => onSelect("screentimefilter")} className="btn btn-link text-white text-start w-100">
              Screen time report
            </button>
          </li>


 <li className="nav-item">
            <button onClick={() => onSelect("profile")} className="btn btn-link text-white text-start w-100">
              Profile
            </button>
          </li>


<li className="nav-item mt-auto">
  <button
    onClick={logout}
    className="d-flex align-items-center w-100 px-3 py-2 text-white bg-dark border-0 rounded hover-bg-red transition"
    style={{ justifyContent: "flex-start" }}
  >
    <LogOut size={20} className="me-2" />
    Logout
  </button>
</li>


        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

/*import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import StressChart from "./StressChart";
import TimeChart from "./TimeChart";
import Settings from "./Settings";
import { LogOut } from 'lucide-react';

// Original Code
// import React, { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import StressChart from "./StressChart";
// import TimeChart from "./TimeChart";
// import Settings from "./Settings";
//
// export default function Dashboard() {
//   const { user, logout } = useContext(AuthContext);
//
//   return (
//     <div>
//       <h2>Welcome, {user?.name}</h2>
//       <button onClick={logout}>Logout</button>
//       <StressChart />
//       <TimeChart />
//       <Settings />
//     </div>
//   );
// }

// Corrected and Updated Code
export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center bg-white shadow-md rounded-xl p-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h2>
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <StressChart />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <TimeChart />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <Settings />
        </div>
      </main>
    </div>
  );
}*/



import React, { useState } from "react";
import Sidebar from "./Sidebar";
import StressChart from "./StressChart";
import StressSummary from "./StressSummary";
import StressTable from "./StressTable";
import ScreenTimeSummary from "./ScreenTimeSummary";
import ScreenTimeChart from "./ScreenTimeChart";
import ScreenTimeTable from "./ScreenTimeTable";
import Settings from "./Settings";
import TopSites from "./topsites";
import StressTips from "./stresstips";
import StressFilterControls from "./FilterControls";
import ScreenTimeFilterControls from "./ScreenTimeFiltersControls";
import ProfilePage from "./profile";

const Dashboard = () => {
  const [selectedSection, setSelectedSection] = useState("overview");
  
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar onSelect={setSelectedSection} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4">

        {selectedSection === "overview" && (
          <>
            <StressSummary />
            <div className="my-4">
              <StressChart />
            </div>
            
          </>
        )}

        {selectedSection === "chart" && <><StressTips></StressTips><StressChart /></>}
        {selectedSection === "summary" && <><StressSummary />  <StressTable /> </>}

        {selectedSection === "screenTime" && (
          <>
            <ScreenTimeSummary />
            <div className="my-4">
              <ScreenTimeChart />
            </div>
           
          </>
        )}

 {selectedSection === "screenchart" && <><TopSites></TopSites> <ScreenTimeChart /></>}
 {selectedSection === "screensummary" && <><ScreenTimeSummary />  <ScreenTimeTable /> </>}

{selectedSection === "settings" && (
          <>
            <Settings />
          </>
        )}

        {selectedSection === "filter" && (
          <>
            <StressFilterControls />
          </>
        )}

{selectedSection === "screentimefilter" && (
          <>
            <ScreenTimeFilterControls />
          </>
        )}


{selectedSection === "profile" && (
          <>
            <ProfilePage />
          </>
        )}

      </div>
    </div>




  );
};

export default Dashboard;

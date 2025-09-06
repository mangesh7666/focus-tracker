



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

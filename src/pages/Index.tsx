
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NavigationSidebar from "@/components/NavigationSidebar";
import Header from "@/components/Header";
import PlantOverviewTab from "@/components/tabs/PlantOverviewTab";
import EnergyMixTab from "@/components/tabs/EnergyMixTab";
import ThermalEfficiencyTab from "@/components/tabs/ThermalEfficiencyTab";
import WasteManagementTab from "@/components/tabs/WasteManagementTab";
import EmergencyDrillTab from "@/components/tabs/EmergencyDrillTab";
import ReportingVisualizationTab from "@/components/tabs/ReportingVisualizationTab";
import SettingsTab from "@/components/tabs/SettingsTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<"Engineer" | "Operator" | "Analyst">("Engineer");
  
  // Load user role from localStorage on initial render
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as "Engineer" | "Operator" | "Analyst" | null;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  // Render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <PlantOverviewTab />;
      case "energy-mix":
        return <EnergyMixTab />;
      case "thermal":
        return <ThermalEfficiencyTab />;
      case "waste":
        return <WasteManagementTab />;
      case "emergency":
        return <EmergencyDrillTab />;
      case "reporting":
        return <ReportingVisualizationTab />;
      case "settings":
        return <SettingsTab userRole={userRole} />;
      default:
        return <PlantOverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <NavigationSidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
          
          <div className="flex-1 flex flex-col">
            <Header setUserRole={setUserRole} currentRole={userRole} />
            
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <div className="container mx-auto max-w-7xl">
                {renderActiveTab()}
              </div>
            </main>
            
            <footer className="border-t p-2 px-4 text-xs text-center text-muted-foreground">
              Nuclear Power Plant Simulation Dashboard &copy; {new Date().getFullYear()} | Frontend-Only Demo for Training Purposes
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;

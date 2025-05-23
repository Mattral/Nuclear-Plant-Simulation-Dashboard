
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "../dashboard/MetricCard";
import Gauge from "../dashboard/Gauge";
import DataVisualizer from "../dashboard/DataVisualizer";
import { Radiation, BarChart3, Thermometer, Package } from "lucide-react";
import { WasteManagementData, updateWasteManagement, getInitialWasteManagement } from "@/lib/simulationEngine";

export default function WasteManagementTab() {
  const [wasteData, setWasteData] = useState<WasteManagementData>(getInitialWasteManagement());
  const [radiationHistory, setRadiationHistory] = useState<any[]>([]);
  
  // Update data on interval
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = updateWasteManagement();
      setWasteData(updatedData);
      
      // Add to historical data for charts
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newPoint = {
        name: timestamp,
        "Waste Radiation": updatedData.wasteRadiationLevel,
        "Pool Temperature": updatedData.spentFuelTemperature / 10, // Scale for better visualization
      };
      
      setRadiationHistory(prev => {
        const updated = [...prev, newPoint];
        if (updated.length > 12) {
          return updated.slice(-12);
        }
        return updated;
      });
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate visualization data for fuel lifecycle
  const fuelLifecycleData = [
    { name: "Mining", value: 100, color: "#B8C0C2" },
    { name: "Enrichment", value: 100, color: "#0A2463" },
    { name: "Fuel Fabrication", value: 100, color: "#247BA0" },
    { name: "In-Core Usage", value: wasteData.fuelUsagePercentage, color: "#2A9D8F" },
    { name: "Spent Fuel Pool", value: wasteData.spentFuelPoolCapacity, color: "#F4A261" },
    { name: "Dry Cask Storage", value: wasteData.dryCaskOccupancy * 5, color: "#E76F51" },
  ];
  
  // Tooltip content for waste management metrics
  const tooltipContent = {
    fuelUsage: (
      <div className="max-w-xs">
        <p className="font-medium">Current Fuel Usage</p>
        <p className="text-xs">Shows how much of the current fuel load has been consumed</p>
        <p className="text-xs">When reaches 100%, fuel will be moved to spent fuel pool</p>
      </div>
    ),
    spentFuelPool: (
      <div className="max-w-xs">
        <p className="font-medium">Spent Fuel Pool Capacity</p>
        <p className="text-xs">Temporary storage for recently removed fuel</p>
        <p className="text-xs">Must be cooled continuously</p>
        <p className="text-xs">When reaches high capacity, fuel is moved to dry cask storage</p>
      </div>
    ),
    dryCasks: (
      <div className="max-w-xs">
        <p className="font-medium">Dry Cask Storage</p>
        <p className="text-xs">Long-term storage solution for cooled spent fuel</p>
        <p className="text-xs">Each cask holds multiple fuel assemblies</p>
        <p className="text-xs">Current capacity: 24 casks</p>
      </div>
    ),
    radiation: (
      <div className="max-w-xs">
        <p className="font-medium">Waste Radiation Level</p>
        <p className="text-xs">Measures radiation from spent fuel storage areas</p>
        <p className="text-xs">Normal range: 0.5-3.0 mSv/h</p>
        <p className="text-xs">Warning threshold: 3.5 mSv/h</p>
      </div>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Waste Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Fuel Lifecycle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Gauge 
                title="In-Core Fuel Usage"
                value={wasteData.fuelUsagePercentage}
                min={0}
                max={100}
                units="%"
                warning={80}
                danger={95}
                icon={<BarChart3 className="h-4 w-4" />}
                lastUpdated={wasteData.timeLastUpdated}
              />
              
              <Gauge 
                title="Spent Fuel Pool"
                value={wasteData.spentFuelPoolCapacity}
                min={0}
                max={100}
                units="%"
                warning={70}
                danger={90}
                icon={<BarChart3 className="h-4 w-4" />}
                lastUpdated={wasteData.timeLastUpdated}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <MetricCard 
                title="Spent Fuel Temperature"
                value={wasteData.spentFuelTemperature.toFixed(1)}
                unit="°C"
                icon={<Thermometer className="h-4 w-4" />}
                status={
                  wasteData.spentFuelTemperature > 45 
                    ? "danger" 
                    : wasteData.spentFuelTemperature > 40 
                      ? "warning" 
                      : "normal"
                }
                lastUpdated={wasteData.timeLastUpdated}
              />
              
              <MetricCard 
                title="Dry Cask Occupancy"
                value={wasteData.dryCaskOccupancy}
                unit="casks"
                icon={<Package className="h-4 w-4" />}
                description="of 24 total capacity"
                lastUpdated={wasteData.timeLastUpdated}
                tooltipContent={tooltipContent.dryCasks}
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Fuel Lifecycle Flow</h3>
              <div className="w-full bg-muted/50 p-4 rounded-md relative h-10">
                {fuelLifecycleData.map((stage, index) => (
                  <div 
                    key={index}
                    className="absolute h-6 top-2 transition-all duration-300 ease-in-out"
                    style={{
                      width: `${100 / fuelLifecycleData.length}%`,
                      left: `${(index * 100) / fuelLifecycleData.length}%`,
                      background: stage.color,
                      opacity: stage.value / 100,
                      borderRadius: '0.25rem',
                    }}
                    title={`${stage.name}: ${stage.value}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                {fuelLifecycleData.map((stage, index) => (
                  <div key={index} style={{ width: `${100 / fuelLifecycleData.length}%` }} className="text-center">
                    {stage.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Radiation Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <DataVisualizer
              title=""
              type="line"
              data={radiationHistory}
              dataKeys={["Waste Radiation", "Pool Temperature"]}
              colors={["#EF476F", "#F4A261"]}
              XAxisLabel="Time"
              height={250}
            />
            
            <div className="mt-4">
              <MetricCard 
                title="Waste Radiation Level"
                value={wasteData.wasteRadiationLevel.toFixed(2)}
                unit="mSv/h"
                icon={<Radiation className="h-4 w-4" />}
                status={
                  wasteData.wasteRadiationLevel > 4 
                    ? "danger" 
                    : wasteData.wasteRadiationLevel > 3 
                      ? "warning" 
                      : "normal"
                }
                lastUpdated={wasteData.timeLastUpdated}
                tooltipContent={tooltipContent.radiation}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Waste Storage Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-60 bg-muted/30 rounded-md overflow-hidden">
            {/* Reactor Core */}
            <div className="absolute left-[10%] top-[30%] w-16 h-16 bg-nuclear-blue/20 border border-nuclear-blue rounded-md flex items-center justify-center">
              <div className="text-xs font-medium">Reactor</div>
              <div className="absolute -bottom-8 text-xs">{wasteData.fuelUsagePercentage.toFixed(0)}%</div>
            </div>
            
            {/* Arrow from Reactor to Spent Fuel Pool */}
            <div className="absolute left-[20%] top-[38%] w-[15%] h-0.5 bg-muted-foreground">
              <div className="absolute right-0 top-0 w-2 h-2 border-t border-r border-muted-foreground transform rotate-45 -translate-y-1/2 translate-x-1/2"></div>
            </div>
            
            {/* Spent Fuel Pool */}
            <div 
              className="absolute left-[40%] top-[30%] w-20 h-16 border border-nuclear-warning rounded-md flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(to top, rgba(244, 162, 97, 0.3) ${wasteData.spentFuelPoolCapacity}%, transparent ${wasteData.spentFuelPoolCapacity}%)`
              }}
            >
              <div className="text-xs font-medium text-center">Spent Fuel Pool</div>
              <div className="absolute -bottom-8 text-xs">{wasteData.spentFuelPoolCapacity.toFixed(0)}%</div>
            </div>
            
            {/* Arrow from Spent Fuel Pool to Dry Cask */}
            <div className="absolute left-[60%] top-[38%] w-[15%] h-0.5 bg-muted-foreground">
              <div className="absolute right-0 top-0 w-2 h-2 border-t border-r border-muted-foreground transform rotate-45 -translate-y-1/2 translate-x-1/2"></div>
            </div>
            
            {/* Dry Cask Storage */}
            <div className="absolute left-[80%] top-[30%] w-16 h-16 bg-muted/50 border border-nuclear-danger rounded-md flex items-center justify-center">
              <div className="text-xs font-medium text-center">Dry Cask Storage</div>
              <div className="absolute -bottom-8 text-xs">{wasteData.dryCaskOccupancy} of 24</div>
            </div>
            
            {/* Temperature indicator for Spent Fuel Pool */}
            <div className="absolute left-[42%] top-[20%] flex items-center">
              <Thermometer className="h-4 w-4 text-nuclear-danger" />
              <span className="text-xs ml-1">{wasteData.spentFuelTemperature.toFixed(1)}°C</span>
            </div>
            
            {/* Radiation indicator */}
            <div className="absolute left-[50%] bottom-[10%] flex items-center">
              <Radiation className="h-4 w-4 text-nuclear-danger" />
              <span className="text-xs ml-1">{wasteData.wasteRadiationLevel.toFixed(2)} mSv/h</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
            <h3 className="font-medium mb-1">Nuclear Fuel Cycle:</h3>
            <p className="text-xs text-muted-foreground">
              Fresh fuel assemblies are loaded into the reactor core where they undergo fission for 18-24 months.
              After depleting their energy potential, they are moved to the spent fuel pool for 5-10 years to cool.
              Finally, after sufficient cooling, they are transferred to dry cask storage for long-term containment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

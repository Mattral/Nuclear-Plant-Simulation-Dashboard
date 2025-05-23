
import { useState, useEffect } from "react";
import MetricCard from "../dashboard/MetricCard";
import Gauge from "../dashboard/Gauge";
import ControlRods from "../dashboard/ControlRods";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Gauge as GaugeIcon, Droplet, BarChart3, Radiation, AlertTriangle } from "lucide-react";
import { ReactorMetrics, alertThresholds, updateReactorMetrics, getInitialReactorMetrics } from "@/lib/simulationEngine";

export default function PlantOverviewTab() {
  const [reactorData, setReactorData] = useState<ReactorMetrics>(getInitialReactorMetrics());
  
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = updateReactorMetrics();
      setReactorData(updatedData);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Helper function to determine status based on thresholds
  const getStatus = (value: number, warningThreshold: number, dangerThreshold: number) => {
    if (value >= dangerThreshold) return "danger";
    if (value >= warningThreshold) return "warning";
    return "normal";
  };
  
  const coreTemperatureStatus = getStatus(
    reactorData.coreTemperature, 
    alertThresholds.highCoreTemperature - 10, 
    alertThresholds.highCoreTemperature
  );
  
  const pressureStatus = getStatus(
    reactorData.primaryLoopPressure, 
    alertThresholds.highPrimaryPressure - 0.3, 
    alertThresholds.highPrimaryPressure
  );
  
  const coolantStatus = reactorData.coolantFlowRate < alertThresholds.lowCoolantFlow + 2000 
    ? reactorData.coolantFlowRate < alertThresholds.lowCoolantFlow 
      ? "danger" 
      : "warning"
    : "normal";
  
  const radiationStatus = getStatus(
    reactorData.radiationLevel, 
    alertThresholds.highRadiation / 2, 
    alertThresholds.highRadiation
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Plant Overview</h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={reactorData.scramStatus ? "destructive" : "outline"}
            className="flex items-center gap-1"
          >
            {reactorData.scramStatus && <AlertTriangle className="h-3.5 w-3.5" />}
            SCRAM Status: {reactorData.scramStatus ? "ACTIVE" : "Standby"}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard 
          title="Core Temperature"
          value={reactorData.coreTemperature}
          unit="°C"
          icon={<Thermometer className="h-4 w-4" />}
          status={coreTemperatureStatus}
          lastUpdated={reactorData.timeLastUpdated}
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Core Temperature</p>
              <p className="text-xs">Normal operating range: 315°C - 330°C</p>
              <p className="text-xs">Warning threshold: {alertThresholds.highCoreTemperature - 10}°C</p>
              <p className="text-xs">Critical threshold: {alertThresholds.highCoreTemperature}°C</p>
            </div>
          }
        />
        
        <MetricCard 
          title="Primary Loop Pressure"
          value={reactorData.primaryLoopPressure}
          unit="MPa"
          icon={<GaugeIcon className="h-4 w-4" />}
          status={pressureStatus}
          lastUpdated={reactorData.timeLastUpdated}
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Primary Loop Pressure</p>
              <p className="text-xs">Normal operating range: 15.0 - 15.7 MPa</p>
              <p className="text-xs">Warning threshold: {alertThresholds.highPrimaryPressure - 0.3} MPa</p>
              <p className="text-xs">Critical threshold: {alertThresholds.highPrimaryPressure} MPa</p>
            </div>
          }
        />
        
        <MetricCard 
          title="Coolant Flow Rate"
          value={Math.round(reactorData.coolantFlowRate).toLocaleString()}
          unit="m³/h"
          icon={<Droplet className="h-4 w-4" />}
          status={coolantStatus}
          lastUpdated={reactorData.timeLastUpdated}
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Coolant Flow Rate</p>
              <p className="text-xs">Normal operating range: {'>'}52,000 m³/h</p>
              <p className="text-xs">Warning threshold: {alertThresholds.lowCoolantFlow + 2000} m³/h</p>
              <p className="text-xs">Critical threshold: {alertThresholds.lowCoolantFlow} m³/h</p>
            </div>
          }
        />
        
        <MetricCard 
          title="Containment Pressure"
          value={reactorData.containmentPressure}
          unit="kPa"
          icon={<GaugeIcon className="h-4 w-4" />}
          status={getStatus(
            reactorData.containmentPressure, 
            alertThresholds.highContainmentPressure - 5, 
            alertThresholds.highContainmentPressure
          )}
          lastUpdated={reactorData.timeLastUpdated}
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Containment Pressure</p>
              <p className="text-xs">Normal operating range: 100 - 105 kPa</p>
              <p className="text-xs">Warning threshold: {alertThresholds.highContainmentPressure - 5} kPa</p>
              <p className="text-xs">Critical threshold: {alertThresholds.highContainmentPressure} kPa</p>
            </div>
          }
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Gauge 
          title="Fuel Burnup"
          value={reactorData.fuelBurnup}
          min={0}
          max={100}
          units="%"
          warning={80}
          danger={95}
          icon={<BarChart3 className="h-4 w-4" />}
          lastUpdated={reactorData.timeLastUpdated}
        />
        
        <MetricCard 
          title="Radiation Level"
          value={reactorData.radiationLevel}
          unit="mSv/h"
          icon={<Radiation className="h-4 w-4" />}
          status={radiationStatus}
          lastUpdated={reactorData.timeLastUpdated}
          className="lg:col-span-1"
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Radiation Level</p>
              <p className="text-xs">Normal operating range: 0.1 - 0.25 mSv/h</p>
              <p className="text-xs">Warning threshold: {alertThresholds.highRadiation / 2} mSv/h</p>
              <p className="text-xs">Critical threshold: {alertThresholds.highRadiation} mSv/h</p>
            </div>
          }
        />
        
        <div className="md:col-span-2 lg:col-span-3">
          <ControlRods positions={reactorData.controlRodPositions} />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import MetricCard from "../dashboard/MetricCard";
import DataVisualizer from "../dashboard/DataVisualizer";
import { Wind, Sun, Droplets, Activity, Scale } from "lucide-react";
import { EnergyMixData, updateEnergyMix, getInitialEnergyMix } from "@/lib/simulationEngine";

export default function EnergyMixTab() {
  const [energyData, setEnergyData] = useState<EnergyMixData>(getInitialEnergyMix());
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);
  const [solarAvailability, setSolarAvailability] = useState<number>(70);
  const [windAvailability, setWindAvailability] = useState<number>(60);
  
  // Update data on interval
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = updateEnergyMix();
      setEnergyData(updatedData);
      
      // Add to historical data for charts (keep last 24 points)
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newPoint = {
        name: timestamp,
        Nuclear: updatedData.nuclear,
        Solar: updatedData.solar,
        Wind: updatedData.wind,
        Hydro: updatedData.hydro,
        Demand: updatedData.demand,
      };
      
      setSimulationHistory(prev => {
        const updated = [...prev, newPoint];
        if (updated.length > 12) {
          return updated.slice(-12);
        }
        return updated;
      });
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Prepare data for pie chart
  const energySourcesData = [
    { name: "Nuclear", value: energyData.nuclear },
    { name: "Solar", value: energyData.solar },
    { name: "Wind", value: energyData.wind },
    { name: "Hydro", value: energyData.hydro },
  ];
  
  const totalGeneration = energyData.nuclear + energyData.solar + energyData.wind + energyData.hydro;
  const nuclearPercentage = Math.round((energyData.nuclear / totalGeneration) * 100);
  
  // Calculate energy balance
  const surplus = totalGeneration - energyData.demand;
  const energyBalanceStatus = 
    surplus < -100 ? "danger" : 
    surplus < 0 ? "warning" : 
    "success";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Energy Mix & Sustainability</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Energy Generation Mix</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <DataVisualizer
              title=""
              type="line"
              data={simulationHistory}
              dataKeys={["Nuclear", "Solar", "Wind", "Hydro", "Demand"]}
              colors={["#0A2463", "#FFD166", "#F4A261", "#2A9D8F", "#EF476F"]}
              XAxisLabel="Time"
              YAxisLabel="MW"
              height={300}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Current Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DataVisualizer
              title=""
              type="pie"
              data={energySourcesData}
              dataKeys={["value"]}
              colors={["#0A2463", "#FFD166", "#F4A261", "#2A9D8F"]}
              height={220}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Nuclear Output"
          value={energyData.nuclear}
          unit="MW"
          icon={<Activity className="h-4 w-4" />}
          description={`${nuclearPercentage}% of total generation`}
          lastUpdated={energyData.timeLastUpdated}
        />
        
        <MetricCard 
          title="Solar Generation"
          value={energyData.solar}
          unit="MW"
          icon={<Sun className="h-4 w-4" />}
          description={`${Math.round((energyData.solar / totalGeneration) * 100)}% of total`}
          lastUpdated={energyData.timeLastUpdated}
        />
        
        <MetricCard 
          title="Wind Generation"
          value={energyData.wind}
          unit="MW"
          icon={<Wind className="h-4 w-4" />}
          description={`${Math.round((energyData.wind / totalGeneration) * 100)}% of total`}
          lastUpdated={energyData.timeLastUpdated}
        />
        
        <MetricCard 
          title="Hydro Generation"
          value={energyData.hydro}
          unit="MW"
          icon={<Droplets className="h-4 w-4" />}
          description={`${Math.round((energyData.hydro / totalGeneration) * 100)}% of total`}
          lastUpdated={energyData.timeLastUpdated}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard 
          title="Energy Balance"
          value={surplus >= 0 ? `+${surplus}` : surplus}
          unit="MW"
          status={energyBalanceStatus}
          icon={<Scale className="h-4 w-4" />}
          description={surplus >= 0 ? "Grid surplus (stable)" : "Grid deficit (unstable)"}
          lastUpdated={energyData.timeLastUpdated}
          tooltipContent={
            <div className="max-w-xs">
              <p className="font-medium">Energy Balance</p>
              <p className="text-xs">Total Generation: {totalGeneration} MW</p>
              <p className="text-xs">Grid Demand: {energyData.demand} MW</p>
              <p className="text-xs">Surplus/Deficit: {surplus} MW</p>
            </div>
          }
        />
        
        <MetricCard 
          title="CO₂ Emissions Avoided"
          value={energyData.co2Avoided.toLocaleString()}
          unit="tons"
          status="success"
          description="Compared to equivalent fossil fuel generation"
          lastUpdated={energyData.timeLastUpdated}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Renewable Availability Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sun className="h-5 w-5 text-nuclear-warning mr-2" />
                  <h3 className="font-medium">Solar Availability</h3>
                </div>
                <span className="text-sm font-medium">{solarAvailability}%</span>
              </div>
              <Slider
                value={[solarAvailability]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setSolarAvailability(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Simulates cloud cover and daylight conditions affecting solar power generation
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wind className="h-5 w-5 text-nuclear-blue-light mr-2" />
                  <h3 className="font-medium">Wind Availability</h3>
                </div>
                <span className="text-sm font-medium">{windAvailability}%</span>
              </div>
              <Slider
                value={[windAvailability]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setWindAvailability(value[0])}
              />
              <p className="text-xs text-muted-foreground">
                Simulates wind speed conditions affecting turbine power output
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
            <p>
              Adjust the sliders to simulate changing weather conditions and observe how the nuclear plant 
              adapts its output to maintain grid stability while accommodating renewable fluctuations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

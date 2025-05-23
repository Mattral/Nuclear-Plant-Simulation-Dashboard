
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from "../dashboard/MetricCard";
import DataVisualizer from "../dashboard/DataVisualizer";
import Gauge from "../dashboard/Gauge";
import { Thermometer, Droplet, Gauge as GaugeIcon, Flame, BookOpen, Info } from "lucide-react";
import { ThermalEfficiencyData, updateThermalEfficiency, getInitialThermalEfficiency } from "@/lib/simulationEngine";

export default function ThermalEfficiencyTab() {
  const [thermalData, setThermalData] = useState<ThermalEfficiencyData>(getInitialThermalEfficiency());
  const [efficiencyHistory, setEfficiencyHistory] = useState<any[]>([]);
  
  // Update data on interval
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = updateThermalEfficiency();
      setThermalData(updatedData);
      
      // Add to historical data for charts
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newPoint = {
        name: timestamp,
        "Heat Rate": updatedData.heatRate,
        "Turbine Efficiency": updatedData.turbineEfficiency,
      };
      
      setEfficiencyHistory(prev => {
        const updated = [...prev, newPoint];
        if (updated.length > 12) {
          return updated.slice(-12);
        }
        return updated;
      });
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate overall thermal efficiency (3412 BTU/kWh is perfect conversion)
  const thermalEfficiency = 3412 / thermalData.heatRate * 100;
  
  // Construct data for the Rankine cycle visualization
  const rankineStages = [
    { name: "Reactor", temperature: thermalData.feedwaterTemperature + 100, pressure: 15.5, efficiency: 100 },
    { name: "HP Turbine", temperature: thermalData.feedwaterTemperature + 50, pressure: 7.0, efficiency: thermalData.turbineEfficiency + 2 },
    { name: "LP Turbine", temperature: thermalData.feedwaterTemperature - 50, pressure: 2.0, efficiency: thermalData.turbineEfficiency - 2 },
    { name: "Condenser", temperature: thermalData.ambientTemperature + 15, pressure: thermalData.condenserVacuum, efficiency: thermalData.coolingTowerEfficiency },
    { name: "Feedwater", temperature: thermalData.feedwaterTemperature, pressure: 15.0, efficiency: 95 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Thermal Efficiency</h2>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <GaugeIcon className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            User Guide
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Heat Rate & Turbine Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <DataVisualizer
                  title=""
                  type="line"
                  data={efficiencyHistory}
                  dataKeys={["Heat Rate", "Turbine Efficiency"]}
                  colors={["#EF476F", "#2A9D8F"]}
                  XAxisLabel="Time"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <Gauge 
                title="Overall Thermal Efficiency"
                value={parseFloat(thermalEfficiency.toFixed(2))}
                min={30}
                max={40}
                units="%"
                warning={32}
                danger={31}
                success={35}
                icon={<Flame className="h-4 w-4" />}
                lastUpdated={thermalData.timeLastUpdated}
              />
              
              <MetricCard 
                title="Heat Rate"
                value={thermalData.heatRate.toFixed(0)}
                unit="BTU/kWh"
                icon={<Flame className="h-4 w-4" />}
                status={thermalData.heatRate > 10400 ? "danger" : thermalData.heatRate > 10200 ? "warning" : "success"}
                description="Lower is better"
                lastUpdated={thermalData.timeLastUpdated}
                tooltipContent={
                  <div className="max-w-xs">
                    <p className="font-medium">Heat Rate</p>
                    <p className="text-xs">Measures how efficiently the plant converts heat to electricity</p>
                    <p className="text-xs">Lower values indicate better efficiency</p>
                    <p className="text-xs">Optimal range: 9,800-10,200 BTU/kWh</p>
                  </div>
                }
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Turbine Efficiency"
              value={thermalData.turbineEfficiency.toFixed(1)}
              unit="%"
              icon={<GaugeIcon className="h-4 w-4" />}
              status={thermalData.turbineEfficiency < 89 ? "danger" : thermalData.turbineEfficiency < 91 ? "warning" : "success"}
              lastUpdated={thermalData.timeLastUpdated}
            />
            
            <MetricCard 
              title="Condenser Vacuum"
              value={thermalData.condenserVacuum}
              unit="kPa"
              icon={<GaugeIcon className="h-4 w-4" />}
              status={thermalData.condenserVacuum > 5.3 ? "danger" : thermalData.condenserVacuum > 5.2 ? "warning" : "normal"}
              lastUpdated={thermalData.timeLastUpdated}
            />
            
            <MetricCard 
              title="Feedwater Temp"
              value={thermalData.feedwaterTemperature.toFixed(1)}
              unit="°C"
              icon={<Thermometer className="h-4 w-4" />}
              lastUpdated={thermalData.timeLastUpdated}
            />
            
            <MetricCard 
              title="Cooling Tower Efficiency"
              value={thermalData.coolingTowerEfficiency.toFixed(1)}
              unit="%"
              icon={<Droplet className="h-4 w-4" />}
              status={thermalData.coolingTowerEfficiency < 70 ? "danger" : thermalData.coolingTowerEfficiency < 75 ? "warning" : "success"}
              description={`Ambient Temp: ${thermalData.ambientTemperature.toFixed(1)}°C`}
              lastUpdated={thermalData.timeLastUpdated}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Simplified Rankine Cycle Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="95%" height="95%" viewBox="0 0 900 450" className="overflow-visible">
                    {/* Background grid for better visibility */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                      </pattern>
                      <marker id="arrowhead" markerWidth="12" markerHeight="10" refX="0" refY="5" orient="auto">
                        <polygon points="0 0, 12 5, 0 10" className="fill-blue-600 dark:fill-blue-400" />
                      </marker>
                    </defs>
                    <rect width="900" height="450" fill="url(#grid)" />
                    
                    {/* Enhanced flow lines with better visibility */}
                    <path 
                      d="M180,120 L720,120 L720,330 L180,330 Z" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3"
                      strokeOpacity="0.4" 
                      strokeDasharray="10,5"
                    />
                    
                    {/* Reactor - Enhanced */}
                    <rect x="120" y="80" width="120" height="80" rx="8" className="fill-red-100 stroke-red-500 dark:fill-red-900 dark:stroke-red-400" strokeWidth="3" />
                    <text x="180" y="110" textAnchor="middle" className="text-sm font-bold fill-red-700 dark:fill-red-300">Reactor</text>
                    <text x="180" y="130" textAnchor="middle" className="text-xs fill-red-600 dark:fill-red-400">Heat Source</text>
                    <text x="180" y="145" textAnchor="middle" className="text-xs font-medium fill-red-800 dark:fill-red-200">
                      {rankineStages[0].temperature}°C
                    </text>
                    
                    {/* HP Turbine - Enhanced */}
                    <rect x="340" y="80" width="120" height="80" rx="8" className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400" strokeWidth="3" />
                    <text x="400" y="110" textAnchor="middle" className="text-sm font-bold fill-green-700 dark:fill-green-300">HP Turbine</text>
                    <text x="400" y="130" textAnchor="middle" className="text-xs fill-green-600 dark:fill-green-400">High Pressure</text>
                    <text x="400" y="145" textAnchor="middle" className="text-xs font-medium fill-green-800 dark:fill-green-200">
                      {rankineStages[1].temperature}°C
                    </text>
                    
                    {/* LP Turbine - Enhanced */}
                    <rect x="560" y="80" width="120" height="80" rx="8" className="fill-yellow-100 stroke-yellow-500 dark:fill-yellow-900 dark:stroke-yellow-400" strokeWidth="3" />
                    <text x="620" y="110" textAnchor="middle" className="text-sm font-bold fill-yellow-700 dark:fill-yellow-300">LP Turbine</text>
                    <text x="620" y="130" textAnchor="middle" className="text-xs fill-yellow-600 dark:fill-yellow-400">Low Pressure</text>
                    <text x="620" y="145" textAnchor="middle" className="text-xs font-medium fill-yellow-800 dark:fill-yellow-200">
                      {rankineStages[2].temperature}°C
                    </text>
                    
                    {/* Condenser - Enhanced */}
                    <rect x="560" y="290" width="120" height="80" rx="8" className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400" strokeWidth="3" />
                    <text x="620" y="320" textAnchor="middle" className="text-sm font-bold fill-blue-700 dark:fill-blue-300">Condenser</text>
                    <text x="620" y="340" textAnchor="middle" className="text-xs fill-blue-600 dark:fill-blue-400">Heat Rejection</text>
                    <text x="620" y="355" textAnchor="middle" className="text-xs font-medium fill-blue-800 dark:fill-blue-200">
                      {rankineStages[3].temperature}°C
                    </text>
                    
                    {/* Feedwater Heater - Enhanced */}
                    <rect x="120" y="290" width="120" height="80" rx="8" className="fill-purple-100 stroke-purple-500 dark:fill-purple-900 dark:stroke-purple-400" strokeWidth="3" />
                    <text x="180" y="320" textAnchor="middle" className="text-sm font-bold fill-purple-700 dark:fill-purple-300">Feedwater</text>
                    <text x="180" y="340" textAnchor="middle" className="text-xs fill-purple-600 dark:fill-purple-400">Pump & Heat</text>
                    <text x="180" y="355" textAnchor="middle" className="text-xs font-medium fill-purple-800 dark:fill-purple-200">
                      {rankineStages[4].temperature}°C
                    </text>
                    
                    {/* Enhanced flow arrows with labels */}
                    <path 
                      d="M240,120 L340,120" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      markerEnd="url(#arrowhead)" 
                    />
                    <text x="290" y="110" textAnchor="middle" className="text-xs font-medium fill-blue-600 dark:fill-blue-400">Steam</text>
                    
                    <path 
                      d="M460,120 L560,120" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      markerEnd="url(#arrowhead)" 
                    />
                    <text x="510" y="110" textAnchor="middle" className="text-xs font-medium fill-blue-600 dark:fill-blue-400">Steam</text>
                    
                    <path 
                      d="M620,160 L620,290" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      markerEnd="url(#arrowhead)" 
                    />
                    <text x="640" y="225" className="text-xs font-medium fill-blue-600 dark:fill-blue-400">Exhaust</text>
                    
                    <path 
                      d="M560,330 L240,330" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      markerEnd="url(#arrowhead)" 
                    />
                    <text x="400" y="350" textAnchor="middle" className="text-xs font-medium fill-blue-600 dark:fill-blue-400">Condensate</text>
                    
                    <path 
                      d="M180,290 L180,160" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="4" 
                      markerEnd="url(#arrowhead)" 
                    />
                    <text x="160" y="225" className="text-xs font-medium fill-blue-600 dark:fill-blue-400" transform="rotate(-90 160 225)">Feedwater</text>
                    
                    {/* Generator symbols */}
                    <circle cx="400" cy="60" r="15" className="fill-yellow-200 stroke-yellow-600 dark:fill-yellow-800 dark:stroke-yellow-400" strokeWidth="2" />
                    <text x="400" y="65" textAnchor="middle" className="text-xs font-bold">G</text>
                    
                    <circle cx="620" cy="60" r="15" className="fill-yellow-200 stroke-yellow-600 dark:fill-yellow-800 dark:stroke-yellow-400" strokeWidth="2" />
                    <text x="620" y="65" textAnchor="middle" className="text-xs font-bold">G</text>
                  </svg>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {rankineStages.map((stage, index) => (
                  <div key={index} className="border-2 rounded-lg p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
                    <div className="font-bold text-sm text-center mb-1">{stage.name}</div>
                    <div className="text-xs text-muted-foreground text-center space-y-1">
                      <div>{stage.temperature}°C</div>
                      <div>{stage.pressure} MPa</div>
                      <div className="font-medium text-green-600 dark:text-green-400">
                        Eff: {stage.efficiency.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Understanding Thermal Efficiency in Nuclear Power Plants
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">What is Thermal Efficiency?</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    Thermal efficiency measures how effectively a nuclear power plant converts heat energy from nuclear fission into electrical energy. 
                    It's expressed as a percentage and calculated as the ratio of electrical energy output to thermal energy input.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium">Formula: Thermal Efficiency = (Electrical Output / Heat Input) × 100%</p>
                    <p className="text-xs mt-1 text-muted-foreground">Typical nuclear plants achieve 33-37% thermal efficiency</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">The Rankine Cycle Process</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    Nuclear power plants use the Rankine thermodynamic cycle to convert heat into electricity. This process involves four main stages:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">1. Heat Generation (Reactor)</h4>
                        <p className="text-xs">Nuclear fission in the reactor core generates intense heat (~300°C). This heat is transferred to the primary coolant system.</p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">2. Steam Generation & HP Turbine</h4>
                        <p className="text-xs">Heat converts water to high-pressure steam (~250°C), which drives the High Pressure turbine to generate electricity.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">3. Expansion (LP Turbine)</h4>
                        <p className="text-xs">Partially expanded steam continues through the Low Pressure turbine (~150°C) for additional electricity generation.</p>
                      </div>
                      
                      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">4. Condensation & Pumping</h4>
                        <p className="text-xs">Exhaust steam is condensed back to water (~40°C) and pumped back to the reactor, completing the cycle.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-1">Heat Rate</h4>
                        <p className="text-xs text-muted-foreground">Measures BTU of heat needed per kWh of electricity. Lower values indicate better efficiency. Optimal range: 9,800-10,200 BTU/kWh.</p>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-1">Turbine Efficiency</h4>
                        <p className="text-xs text-muted-foreground">Percentage of thermal energy converted to mechanical energy by turbines. Target: {'>'}90% for optimal performance.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-1">Condenser Vacuum</h4>
                        <p className="text-xs text-muted-foreground">Lower pressure in condenser improves cycle efficiency. Optimal: {'<'}5.2 kPa for maximum heat rejection.</p>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium mb-1">Cooling Tower Efficiency</h4>
                        <p className="text-xs text-muted-foreground">Effectiveness of heat removal from condenser. Target: {'>'}75% efficiency, affected by ambient temperature.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Factors Affecting Efficiency</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Temperature Difference:</strong> Larger temperature differences between heat source and sink improve efficiency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Steam Pressure:</strong> Higher steam pressure and temperature increase thermal efficiency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Condenser Performance:</strong> Better vacuum and cooling improve heat rejection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Equipment Condition:</strong> Well-maintained turbines and heat exchangers operate more efficiently</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span><strong>Environmental Conditions:</strong> Ambient temperature affects cooling system performance</span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Monitoring and Optimization</h3>
                  <p className="text-sm leading-relaxed mb-4">
                    This dashboard provides real-time monitoring of key thermal efficiency parameters. Operators use this information to:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Detect Issues</div>
                      <div className="text-xs text-muted-foreground">Early identification of performance degradation</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Optimize Operations</div>
                      <div className="text-xs text-muted-foreground">Adjust parameters for maximum efficiency</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-1">Plan Maintenance</div>
                      <div className="text-xs text-muted-foreground">Schedule maintenance based on performance trends</div>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

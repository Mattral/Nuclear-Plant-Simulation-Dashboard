
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataVisualizer from "../dashboard/DataVisualizer";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileBarChart, Calendar, AlertTriangle } from "lucide-react";
import { 
  ReactorMetrics, 
  EnergyMixData, 
  ThermalEfficiencyData, 
  WasteManagementData,
  updateReactorMetrics,
  updateEnergyMix,
  updateThermalEfficiency,
  updateWasteManagement,
  getEmergencyScenarioStatus,
} from "@/lib/simulationEngine";

export default function ReportingVisualizationTab() {
  const [reportType, setReportType] = useState<string>("daily");
  const [timeframe, setTimeframe] = useState<string>("24h");
  const [allData, setAllData] = useState<{
    reactor: ReactorMetrics[];
    energy: EnergyMixData[];
    thermal: ThermalEfficiencyData[];
    waste: WasteManagementData[];
    alerts: AlertEvent[];
  }>({
    reactor: [],
    energy: [],
    thermal: [],
    waste: [],
    alerts: [],
  });
  
  const [selectedChart, setSelectedChart] = useState<string>("temperature");
  
  // Generate simulated historical data on component mount
  useEffect(() => {
    const generateHistoricalData = () => {
      const now = new Date();
      const reactor: ReactorMetrics[] = [];
      const energy: EnergyMixData[] = [];
      const thermal: ThermalEfficiencyData[] = [];
      const waste: WasteManagementData[] = [];
      
      // Generate data for the past 24 hours (24 points)
      for (let i = 24; i >= 0; i--) {
        const timePoint = new Date(now.getTime() - i * 3600 * 1000);
        
        // Get current data and adjust slightly to simulate historical
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
        
        reactor.push({
          ...updateReactorMetrics(),
          coreTemperature: 320 * randomFactor,
          timeLastUpdated: timePoint,
        });
        
        energy.push({
          ...updateEnergyMix(),
          nuclear: 1000 * randomFactor,
          timeLastUpdated: timePoint,
        });
        
        thermal.push({
          ...updateThermalEfficiency(),
          turbineEfficiency: 92 * randomFactor,
          timeLastUpdated: timePoint,
        });
        
        waste.push({
          ...updateWasteManagement(),
          timeLastUpdated: timePoint,
        });
      }
      
      // Generate some sample alerts
      const alerts: AlertEvent[] = [
        {
          id: "a1",
          timestamp: new Date(now.getTime() - 2 * 3600 * 1000),
          type: "warning",
          system: "Primary Loop",
          message: "High pressure deviation (15.7 MPa)",
          status: "resolved",
        },
        {
          id: "a2",
          timestamp: new Date(now.getTime() - 5 * 3600 * 1000),
          type: "info",
          system: "Feedwater",
          message: "Heater efficiency below optimal range",
          status: "acknowledged",
        },
        {
          id: "a3",
          timestamp: new Date(now.getTime() - 8 * 3600 * 1000),
          type: "critical",
          system: "Control Rod Drive",
          message: "Rod position disagree - Bank B Rod 5",
          status: "resolved",
        },
        {
          id: "a4",
          timestamp: new Date(now.getTime() - 14 * 3600 * 1000),
          type: "warning",
          system: "Radiation Monitoring",
          message: "Momentary spike in spent fuel area (2.9 mSv/h)",
          status: "resolved",
        },
        {
          id: "a5",
          timestamp: new Date(now.getTime() - 18 * 3600 * 1000),
          type: "info",
          system: "Grid Interface",
          message: "Frequency fluctuation (49.8 Hz)",
          status: "resolved",
        },
      ];
      
      // Check if emergency is active to add emergency alert
      const emergencyStatus = getEmergencyScenarioStatus();
      if (emergencyStatus.active) {
        alerts.unshift({
          id: "e1",
          timestamp: new Date(),
          type: "critical",
          system: "Emergency Response",
          message: `${emergencyStatus.type} scenario in progress`,
          status: "active",
        });
      }
      
      setAllData({ reactor, energy, thermal, waste, alerts });
    };
    
    generateHistoricalData();
    
    // Update data periodically
    const interval = setInterval(() => {
      setAllData(prev => {
        const now = new Date();
        return {
          ...prev,
          reactor: [...prev.reactor.slice(1), {
            ...updateReactorMetrics(),
            timeLastUpdated: now,
          }],
          energy: [...prev.energy.slice(1), {
            ...updateEnergyMix(),
            timeLastUpdated: now,
          }],
          thermal: [...prev.thermal.slice(1), {
            ...updateThermalEfficiency(),
            timeLastUpdated: now,
          }],
          waste: [...prev.waste.slice(1), {
            ...updateWasteManagement(),
            timeLastUpdated: now,
          }],
        };
      });
    }, 30000); // update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter data based on selected timeframe
  const getFilteredData = () => {
    const hoursToFilter = timeframe === "24h" ? 24 : timeframe === "12h" ? 12 : 6;
    
    return {
      reactor: allData.reactor.slice(-hoursToFilter),
      energy: allData.energy.slice(-hoursToFilter),
      thermal: allData.thermal.slice(-hoursToFilter),
    };
  };
  
  // Prepare chart data based on selected chart
  const getChartData = () => {
    const filtered = getFilteredData();
    
    switch (selectedChart) {
      case "temperature":
        return filtered.reactor.map(point => ({
          name: point.timeLastUpdated.getHours() + ":00",
          "Core Temperature": point.coreTemperature,
        }));
        
      case "energy":
        return filtered.energy.map(point => ({
          name: point.timeLastUpdated.getHours() + ":00",
          "Nuclear": point.nuclear,
          "Solar": point.solar,
          "Wind": point.wind,
          "Hydro": point.hydro,
        }));
        
      case "efficiency":
        return filtered.thermal.map(point => ({
          name: point.timeLastUpdated.getHours() + ":00",
          "Turbine Efficiency": point.turbineEfficiency,
          "Cooling Tower": point.coolingTowerEfficiency,
        }));
        
      default:
        return [];
    }
  };
  
  // Get chart configuration
  const getChartConfig = () => {
    switch (selectedChart) {
      case "temperature":
        return {
          title: "Core Temperature Trend",
          type: "line" as "line",
          dataKeys: ["Core Temperature"],
          colors: ["#EF476F"],
        };
        
      case "energy":
        return {
          title: "Energy Mix Trend",
          type: "area" as "line",
          dataKeys: ["Nuclear", "Solar", "Wind", "Hydro"],
          colors: ["#0A2463", "#FFD166", "#F4A261", "#2A9D8F"],
        };
        
      case "efficiency":
        return {
          title: "Efficiency Metrics",
          type: "line" as "line",
          dataKeys: ["Turbine Efficiency", "Cooling Tower"],
          colors: ["#2A9D8F", "#247BA0"],
        };
        
      default:
        return {
          title: "Data Visualization",
          type: "line" as "line",
          dataKeys: [],
          colors: [],
        };
    }
  };
  
  // Export data as CSV
  const exportCSV = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return;
    
    // Create CSV headers and rows
    const headers = ["Timestamp", ...Object.keys(chartData[0]).filter(k => k !== "name")];
    const rows = chartData.map(point => {
      return [
        point.name,
        ...Object.entries(point)
          .filter(([key]) => key !== "name")
          .map(([, value]) => value),
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");
    
    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedChart}_data_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate daily report summary
  const getDailyReportSummary = () => {
    if (allData.reactor.length === 0) return {};
    
    const latestReactor = allData.reactor[allData.reactor.length - 1];
    const latestEnergy = allData.energy[allData.energy.length - 1];
    const latestThermal = allData.thermal[allData.thermal.length - 1];
    
    // Calculate averages
    const avgTemperature = allData.reactor.reduce((sum, point) => sum + point.coreTemperature, 0) / allData.reactor.length;
    const avgEfficiency = allData.thermal.reduce((sum, point) => sum + point.turbineEfficiency, 0) / allData.thermal.length;
    const totalGeneration = allData.energy.reduce((sum, point) => sum + point.nuclear, 0);
    
    // Count alerts by type
    const alertCounts = {
      critical: allData.alerts.filter(alert => alert.type === "critical").length,
      warning: allData.alerts.filter(alert => alert.type === "warning").length,
      info: allData.alerts.filter(alert => alert.type === "info").length,
    };
    
    return {
      date: new Date().toLocaleDateString(),
      avgTemperature: avgTemperature.toFixed(1),
      avgEfficiency: avgEfficiency.toFixed(1),
      totalGeneration: Math.round(totalGeneration),
      maxTemperature: Math.max(...allData.reactor.map(point => point.coreTemperature)).toFixed(1),
      minTemperature: Math.min(...allData.reactor.map(point => point.coreTemperature)).toFixed(1),
      currentStatus: latestReactor.scramStatus ? "SCRAM Active" : "Normal Operation",
      alertCounts,
    };
  };

  const chartConfig = getChartConfig();
  const chartData = getChartData();
  const reportSummary = getDailyReportSummary();
  
  // Format alerts by status
  const activeAlerts = allData.alerts.filter(alert => alert.status === "active");
  
  // Interface for alert events
  interface AlertEvent {
    id: string;
    timestamp: Date;
    type: "warning" | "critical" | "info";
    system: string;
    message: string;
    status: "active" | "acknowledged" | "resolved";
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reporting & Visualization</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Data Visualization</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={selectedChart} onValueChange={setSelectedChart}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Core Temperature</SelectItem>
                    <SelectItem value="energy">Energy Mix</SelectItem>
                    <SelectItem value="efficiency">Efficiency Metrics</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6h">6 Hours</SelectItem>
                    <SelectItem value="12h">12 Hours</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <DataVisualizer
              title=""
              type="line"
              data={chartData}
              dataKeys={chartConfig.dataKeys}
              colors={chartConfig.colors}
              XAxisLabel="Time"
              height={350}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={reportType === "daily" ? "default" : "outline"}
                  onClick={() => setReportType("daily")}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Summary
                </Button>
                <Button
                  variant={reportType === "alert" ? "default" : "outline"}
                  onClick={() => setReportType("alert")}
                  className="justify-start"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alert Log
                </Button>
                <Button
                  variant={reportType === "performance" ? "default" : "outline"}
                  onClick={() => setReportType("performance")}
                  className="justify-start"
                >
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Performance Report
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {activeAlerts.length > 0 && (
            <Card className="bg-nuclear-warning/10 border-nuclear-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-nuclear-warning" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="text-sm p-2 bg-nuclear-warning/5 rounded-md">
                      <div className="font-medium">{alert.system}</div>
                      <div className="text-xs">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {reportType === "daily" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Daily Plant Performance Summary
              </CardTitle>
              <Badge>
                {reportSummary.date}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Reactor Status</div>
                <div className="text-xl">
                  {reportSummary.currentStatus === "Normal Operation" ? (
                    <span className="text-nuclear-success">Normal</span>
                  ) : (
                    <span className="text-nuclear-danger">SCRAM</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Avg Temperature</div>
                <div className="text-xl">{reportSummary.avgTemperature} °C</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Avg Efficiency</div>
                <div className="text-xl">{reportSummary.avgEfficiency}%</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Total Generation</div>
                <div className="text-xl">{reportSummary.totalGeneration} MWh</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Alerts</div>
                <div className="flex space-x-2 text-sm">
                  <span className="text-nuclear-danger">{reportSummary.alertCounts?.critical || 0} critical</span>
                  <span className="text-nuclear-warning">{reportSummary.alertCounts?.warning || 0} warnings</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Temperature Range</div>
                <div className="text-sm">
                  {reportSummary.minTemperature} - {reportSummary.maxTemperature} °C
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-sm mb-3">Key Performance Indicators</h3>
              <DataVisualizer
                title=""
                type="bar"
                data={[
                  { name: "Safety", value: 98 },
                  { name: "Reliability", value: 99.5 },
                  { name: "Efficiency", value: 92 },
                  { name: "Capacity Factor", value: 94 },
                  { name: "Environmental", value: 97 },
                ]}
                dataKeys={["value"]}
                colors={["#0A2463"]}
                XAxisLabel=""
                height={200}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Full Report
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {reportType === "alert" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alert Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allData.alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      {alert.timestamp.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{alert.system}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.type === "critical" ? "destructive" : 
                        alert.type === "warning" ? "outline" : 
                        "secondary"
                      }>
                        {alert.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.status === "active" ? "destructive" : 
                        alert.status === "acknowledged" ? "outline" : 
                        "secondary"
                      }>
                        {alert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Alert Log
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {reportType === "performance" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileBarChart className="h-5 w-5 mr-2" />
              Performance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Energy Production</h3>
                <DataVisualizer
                  title=""
                  type="pie"
                  data={[
                    { name: "Nuclear", value: 65 },
                    { name: "Solar", value: 12 },
                    { name: "Wind", value: 15 },
                    { name: "Hydro", value: 8 },
                  ]}
                  dataKeys={["value"]}
                  colors={["#0A2463", "#FFD166", "#F4A261", "#2A9D8F"]}
                  height={200}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-3">CO₂ Emissions Avoided</h3>
                <DataVisualizer
                  title=""
                  type="bar"
                  data={[
                    { name: "Jan", value: 1250 },
                    { name: "Feb", value: 1100 },
                    { name: "Mar", value: 1350 },
                    { name: "Apr", value: 1200 },
                    { name: "May", value: 1400 },
                    { name: "Jun", value: 1450 },
                  ]}
                  dataKeys={["value"]}
                  colors={["#2A9D8F"]}
                  height={200}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">System Reliability Metrics</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System</TableHead>
                    <TableHead>Uptime (%)</TableHead>
                    <TableHead>MTBF (days)</TableHead>
                    <TableHead>MTTR (hours)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Reactor Control</TableCell>
                    <TableCell>99.97%</TableCell>
                    <TableCell>182.5</TableCell>
                    <TableCell>1.2</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-nuclear-success/20 text-nuclear-success-dark">Excellent</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cooling Systems</TableCell>
                    <TableCell>99.92%</TableCell>
                    <TableCell>175.0</TableCell>
                    <TableCell>1.8</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-nuclear-success/20 text-nuclear-success-dark">Excellent</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Electrical Generation</TableCell>
                    <TableCell>99.85%</TableCell>
                    <TableCell>158.3</TableCell>
                    <TableCell>2.4</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-nuclear-success/20 text-nuclear-success-dark">Excellent</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Safety Systems</TableCell>
                    <TableCell>100.00%</TableCell>
                    <TableCell>365.0</TableCell>
                    <TableCell>0.0</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-nuclear-success/20 text-nuclear-success-dark">Excellent</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Performance Report
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

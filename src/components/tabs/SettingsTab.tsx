
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimulationControls from "../dashboard/SimulationControls";
import { toast } from "sonner";
import { 
  Settings, 
  Save, 
  Users, 
  Bell, 
  Sliders, 
  Eye, 
  RefreshCw 
} from "lucide-react";

export default function SettingsTab({ userRole }: { userRole: string }) {
  const [refreshRate, setRefreshRate] = useState<number>(3);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [sound, setSound] = useState<boolean>(true);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [measurementUnit, setMeasurementUnit] = useState<string>("metric");
  
  // Simulation settings
  const [autoScram, setAutoScram] = useState<boolean>(true);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);
  const [simulationAccuracy, setSimulationAccuracy] = useState<number>(80);
  
  // Persistence
  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboardSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setRefreshRate(parsed.refreshRate || 3);
      setNotifications(parsed.notifications ?? true);
      setSound(parsed.sound ?? true);
      setTheme(parsed.theme || "system");
      setMeasurementUnit(parsed.measurementUnit || "metric");
      setAutoScram(parsed.autoScram ?? true);
      setShowPredictions(parsed.showPredictions ?? true);
      setSimulationAccuracy(parsed.simulationAccuracy || 80);
    }
  }, []);
  
  // Save settings
  const saveSettings = () => {
    const settings = {
      refreshRate,
      notifications,
      sound,
      theme,
      measurementUnit,
      autoScram,
      showPredictions,
      simulationAccuracy
    };
    
    localStorage.setItem("dashboardSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };
  
  // Reset settings to default
  const resetSettings = () => {
    setRefreshRate(3);
    setNotifications(true);
    setSound(true);
    setTheme("system");
    setMeasurementUnit("metric");
    setAutoScram(true);
    setShowPredictions(true);
    setSimulationAccuracy(80);
    
    localStorage.removeItem("dashboardSettings");
    toast.info("Settings reset to default values");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="flex items-center gap-1">
            <Sliders className="h-4 w-4" />
            <span>Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>User Preferences</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: "system" | "light" | "dark") => setTheme(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="refresh-rate">Data Refresh Rate (seconds)</Label>
                <div className="flex items-center space-x-2 w-[180px]">
                  <Slider
                    id="refresh-rate"
                    value={[refreshRate]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setRefreshRate(value[0])}
                  />
                  <span className="w-12 text-center">{refreshRate}s</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="units">Measurement Units</Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (°C, MPa)</SelectItem>
                    <SelectItem value="imperial">Imperial (°F, PSI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {userRole === "Engineer" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="30d">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                      <SelectItem value="90d">90 Days</SelectItem>
                      <SelectItem value="365d">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simulation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scram">
                  <div className="font-medium">Automatic SCRAM</div>
                  <div className="text-sm text-muted-foreground">Automatically initiate SCRAM on critical thresholds</div>
                </Label>
                <Switch
                  id="auto-scram"
                  checked={autoScram}
                  onCheckedChange={setAutoScram}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-predictions">
                  <div className="font-medium">Predictive Analytics</div>
                  <div className="text-sm text-muted-foreground">Show trend predictions based on current data</div>
                </Label>
                <Switch
                  id="show-predictions"
                  checked={showPredictions}
                  onCheckedChange={setShowPredictions}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="simulation-accuracy">
                    <div className="font-medium">Simulation Accuracy Level</div>
                    <div className="text-sm text-muted-foreground">Higher values use more computing resources</div>
                  </Label>
                  <span>{simulationAccuracy}%</span>
                </div>
                <Slider
                  id="simulation-accuracy"
                  value={[simulationAccuracy]}
                  min={50}
                  max={99}
                  step={1}
                  onValueChange={(value) => setSimulationAccuracy(value[0])}
                />
              </div>
            </CardContent>
          </Card>
          
          <SimulationControls />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-notifications">
                  <div className="font-medium">Enable Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive alerts about important events</div>
                </Label>
                <Switch
                  id="enable-notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-sound">
                  <div className="font-medium">Sound Alerts</div>
                  <div className="text-sm text-muted-foreground">Play sound when critical alerts are received</div>
                </Label>
                <Switch
                  id="enable-sound"
                  checked={sound}
                  onCheckedChange={setSound}
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Notification Types</h3>
                <div className="space-y-3">
                  {["Critical Alerts", "Warnings", "System Changes", "Performance Updates"].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <Label htmlFor={`notify-${item.toLowerCase().replace(/\s/g, '-')}`}>
                        {item}
                      </Label>
                      <Switch
                        id={`notify-${item.toLowerCase().replace(/\s/g, '-')}`}
                        defaultChecked={item.includes("Critical") || item.includes("Warnings")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" defaultValue={`${userRole} User`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={`${userRole.toLowerCase()}@nuclear-plant.example`} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Current Role</Label>
                <Input id="role" value={userRole} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  Change your role from the user menu in the header
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-3">Accessibility</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">
                      <div className="font-medium">High Contrast Mode</div>
                      <div className="text-sm text-muted-foreground">Increase contrast for better readability</div>
                    </Label>
                    <Switch id="high-contrast" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">
                      <div className="font-medium">Larger Text</div>
                      <div className="text-sm text-muted-foreground">Increase font size throughout the dashboard</div>
                    </Label>
                    <Switch id="large-text" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={resetSettings} className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          Reset to Default
        </Button>
        <Button onClick={saveSettings} className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import {
  setSimulationMode,
  getSimulationMode,
  activateEmergencyScenario,
  deactivateEmergencyScenario,
  getEmergencyScenarioStatus,
  setSimulationTimeMultiplier,
  resetToDefaults,
} from "@/lib/simulationEngine";
import { useState, useEffect } from "react";

interface SimulationControlsProps {
  onModeChange?: (mode: "live" | "training") => void;
}

export default function SimulationControls({ onModeChange }: SimulationControlsProps) {
  const [mode, setMode] = useState<"live" | "training">(getSimulationMode());
  const [isRunning, setIsRunning] = useState(true);
  const [timeMultiplier, setTimeMultiplier] = useState("1");
  const [emergencyScenario, setEmergencyScenario] = useState<string | "none">("none");
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Update emergency status from simulation engine
  useEffect(() => {
    const status = getEmergencyScenarioStatus();
    setEmergencyActive(status.active);
    if (status.active && status.type) {
      setEmergencyScenario(status.type);
    } else if (!status.active) {
      setEmergencyScenario("none");
    }
  }, []);

  const handleModeChange = (newMode: "live" | "training") => {
    setMode(newMode);
    setSimulationMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleSimulationToggle = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    
    // In a real system, this would pause/resume the simulation
    // For now, we'll just change the mode as a proxy
    if (newState) {
      setSimulationMode(mode);
    } else {
      setSimulationMode("training"); // Training mode is paused
    }
  };

  const handleEmergencyScenario = (scenario: string) => {
    setEmergencyScenario(scenario);
    
    if (scenario === "none") {
      deactivateEmergencyScenario();
      setEmergencyActive(false);
    } else {
      activateEmergencyScenario(scenario);
      setEmergencyActive(true);
    }
  };

  const handleTimeMultiplierChange = (value: string) => {
    setTimeMultiplier(value);
    setSimulationTimeMultiplier(parseFloat(value));
  };

  const handleReset = () => {
    resetToDefaults();
    setEmergencyScenario("none");
    setEmergencyActive(false);
    setTimeMultiplier("1");
    setSimulationTimeMultiplier(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Simulation Controls</span>
          {emergencyActive && (
            <span className="inline-flex items-center bg-nuclear-danger/20 text-nuclear-danger px-2 py-0.5 text-xs rounded-md">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Emergency Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mode-switch">Simulation Mode</Label>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${mode === "training" ? "font-medium" : "text-muted-foreground"}`}>Training</span>
                <Switch 
                  id="mode-switch"
                  checked={mode === "live"}
                  onCheckedChange={(checked) => handleModeChange(checked ? "live" : "training")}
                />
                <span className={`text-sm ${mode === "live" ? "font-medium" : "text-muted-foreground"}`}>Live</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Simulation Status</Label>
              <Button
                size="sm"
                variant={isRunning ? "outline" : "default"}
                onClick={handleSimulationToggle}
                className="space-x-1"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> <span>Resume</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="time-multiplier">Time Multiplier</Label>
              <Select value={timeMultiplier} onValueChange={handleTimeMultiplierChange}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emergency-scenario">Emergency Scenario</Label>
              <Select 
                value={emergencyScenario} 
                onValueChange={handleEmergencyScenario}
                disabled={mode !== "training"}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="LOCA">LOCA</SelectItem>
                  <SelectItem value="BLACKOUT">Blackout</SelectItem>
                  <SelectItem value="OVERPRESSURE">Overpressure</SelectItem>
                  <SelectItem value="CYBER">Cyber Intrusion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Label>Reset Simulation</Label>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleReset}
                className="space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
            
            {mode === "live" && emergencyActive && (
              <div className="mt-2 text-xs text-nuclear-danger bg-nuclear-danger/10 p-2 rounded">
                Emergency scenarios can only be activated in Training mode.
                Switch to Training mode or reset the simulation.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

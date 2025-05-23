import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { activateEmergencyScenario, deactivateEmergencyScenario } from "@/lib/simulationEngine";

export default function EmergencyDrillTab() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [drillStatus, setDrillStatus] = useState<"idle" | "in_progress" | "success" | "failed">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedActions, setSelectedActions] = useState<Record<number, string>>({});
  
  // Reset drill when scenario changes
  useEffect(() => {
    if (activeScenario !== null) {
      setDrillStatus("in_progress");
      setTimeRemaining(120);
      setCurrentStep(0);
      setSelectedActions({});
      
      // Activate emergency in simulation engine
      activateEmergencyScenario(activeScenario);
    } else {
      setDrillStatus("idle");
      deactivateEmergencyScenario();
    }
  }, [activeScenario]);
  
  // Timer countdown when drill is in progress
  useEffect(() => {
    if (drillStatus !== "in_progress" || activeScenario === null) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setDrillStatus("failed");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [drillStatus, activeScenario]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Get the current scenario data
  const getScenarioData = () => {
    switch (activeScenario) {
      case "LOCA":
        return locaScenario;
      case "BLACKOUT":
        return blackoutScenario;
      case "OVERPRESSURE":
        return overpressureScenario;
      case "CYBER":
        return cyberScenario;
      default:
        return null;
    }
  };
  
  const currentScenario = getScenarioData();
  
  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    setSelectedActions({
      ...selectedActions,
      [currentStep]: actionId,
    });
  };
  
  // Move to the next step
  const handleNextStep = () => {
    if (!currentScenario) return;
    
    // Check if the selected action is correct
    const isCorrect = selectedActions[currentStep] === currentScenario.steps[currentStep].correctAction;
    
    if (!isCorrect) {
      setDrillStatus("failed");
      return;
    }
    
    if (currentStep + 1 >= currentScenario.steps.length) {
      // Drill completed successfully
      setDrillStatus("success");
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Reset the drill
  const resetDrill = () => {
    setActiveScenario(null);
    setDrillStatus("idle");
    setTimeRemaining(120);
    setCurrentStep(0);
    setSelectedActions({});
    deactivateEmergencyScenario();
  };
  
  // Calculate progress percentage
  const progressPercentage = currentScenario
    ? Math.round((currentStep / currentScenario.steps.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Emergency Drill Simulator</h2>
        
        {drillStatus === "in_progress" && (
          <div className="flex items-center">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${timeRemaining < 30 ? "bg-nuclear-danger/20 text-nuclear-danger-dark" : ""}`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>
        )}
      </div>
      
      {drillStatus === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Emergency Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarioOptions.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant="outline"
                  className={`h-auto flex flex-col items-start p-4 text-left ${
                    activeScenario === scenario.id ? "border-primary" : ""
                  }`}
                  onClick={() => setActiveScenario(scenario.id)}
                >
                  <div className="flex items-center">
                    <scenario.icon className="h-5 w-5 mr-2 text-nuclear-danger" />
                    <span className="font-medium">{scenario.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Select a scenario to begin the emergency drill training.
            </p>
          </CardFooter>
        </Card>
      )}
      
      {drillStatus === "in_progress" && currentScenario && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-nuclear-danger" />
                  {currentScenario.name}
                </CardTitle>
                <Badge variant="outline">Step {currentStep + 1} of {currentScenario.steps.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="mb-4" />
              
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Current Situation</AlertTitle>
                <AlertDescription>
                  {currentScenario.steps[currentStep].situation}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="font-medium">Select Action:</h3>
                <RadioGroup 
                  value={selectedActions[currentStep] || ""}
                  onValueChange={handleActionSelect}
                >
                  {currentScenario.steps[currentStep].actions.map((action) => (
                    <div className="flex items-start space-x-2" key={action.id}>
                      <RadioGroupItem value={action.id} id={action.id} />
                      <Label htmlFor={action.id} className="text-sm">
                        {action.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleNextStep}
                disabled={!selectedActions[currentStep]}
                className="ml-auto"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentScenario.parameters.map((param) => (
                  <div key={param.name} className="space-y-1">
                    <div className="text-xs font-medium">{param.name}</div>
                    <div className="flex items-center">
                      <span className={`text-sm font-bold ${
                        param.status === "critical" ? "text-nuclear-danger" : 
                        param.status === "warning" ? "text-nuclear-warning" : ""
                      }`}>
                        {param.value} {param.unit}
                      </span>
                      {param.status === "critical" && (
                        <AlertTriangle className="h-3.5 w-3.5 ml-1 text-nuclear-danger" />
                      )}
                      {param.status === "warning" && (
                        <AlertCircle className="h-3.5 w-3.5 ml-1 text-nuclear-warning" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {drillStatus === "success" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-nuclear-success">
              <CheckCircle className="h-5 w-5" />
              Drill Completed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You have successfully managed the {activeScenario} emergency scenario according to protocol.
            </p>
            
            <div className="p-3 bg-muted/50 rounded-md">
              <h3 className="font-medium mb-2">Performance Summary:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Time Remaining:</div>
                  <div className="font-medium">{formatTime(timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Steps Completed:</div>
                  <div className="font-medium">{currentScenario?.steps.length || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Response Rating:</div>
                  <div className="font-medium">
                    {timeRemaining > 60 ? "Excellent" : timeRemaining > 30 ? "Good" : "Satisfactory"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={resetDrill}>
              Return to Scenarios
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {drillStatus === "failed" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-nuclear-danger">
              <XCircle className="h-5 w-5" />
              Drill Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The emergency response was not handled according to protocol.
            </p>
            
            {currentScenario && selectedActions[currentStep] && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Incorrect Action Selected</AlertTitle>
                <AlertDescription>
                  {currentScenario.steps[currentStep].actions.find(
                    (a) => a.id === selectedActions[currentStep]
                  )?.feedback || "Review emergency protocols and try again."}
                </AlertDescription>
              </Alert>
            )}
            
            {timeRemaining === 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Time Expired</AlertTitle>
                <AlertDescription>
                  Emergency response actions must be completed within the time limit.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="p-3 bg-muted/50 rounded-md">
              <h3 className="font-medium mb-2">Corrective Actions:</h3>
              <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                <li>Review emergency response procedures for {activeScenario} scenarios</li>
                <li>Practice quicker decision making within time constraints</li>
                <li>Familiarize with system parameter thresholds and alarm values</li>
                <li>Coordinate with team members for more efficient emergency response</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={resetDrill}>
              Return to Scenarios
            </Button>
            <Button 
              onClick={() => {
                setDrillStatus("in_progress");
                setTimeRemaining(120);
                setCurrentStep(0);
                setSelectedActions({});
              }}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// Emergency scenario options
const scenarioOptions = [
  {
    id: "LOCA",
    name: "Loss of Coolant Accident (LOCA)",
    description: "Simulate a pipe break in the primary cooling system leading to coolant loss.",
    icon: AlertTriangle,
  },
  {
    id: "BLACKOUT",
    name: "Station Blackout",
    description: "Simulate loss of all AC power, requiring emergency backup systems.",
    icon: AlertTriangle,
  },
  {
    id: "OVERPRESSURE",
    name: "Containment Overpressure",
    description: "Simulate excessive pressure building in the containment structure.",
    icon: AlertTriangle,
  },
  {
    id: "CYBER",
    name: "Cyber Intrusion Alert",
    description: "Simulate detection of unauthorized access to plant control systems.",
    icon: AlertTriangle,
  }
];

// LOCA Scenario
const locaScenario = {
  name: "Loss of Coolant Accident (LOCA)",
  description: "A pipe break in the primary cooling system has caused a loss of coolant.",
  steps: [
    {
      situation: "Alarm indicates rapid pressure drop in primary loop. Coolant flow rate decreasing rapidly.",
      actions: [
        { id: "loca1_1", text: "Manually SCRAM the reactor immediately to shut down the fission process.", feedback: "Immediate reactor shutdown is the correct first response to a LOCA." },
        { id: "loca1_2", text: "Attempt to identify the leak location before taking further actions.", feedback: "Locating the leak is secondary to ensuring reactor shutdown." },
        { id: "loca1_3", text: "Increase coolant input to compensate for losses.", feedback: "Adding coolant without addressing the core's power state risks thermal shock." }
      ],
      correctAction: "loca1_1",
    },
    {
      situation: "Reactor has SCRAMed. Emergency core cooling system (ECCS) needs to be activated.",
      actions: [
        { id: "loca2_1", text: "Activate the high-pressure injection system to maintain core cooling.", feedback: "Immediate ECCS activation is critical to maintain core cooling." },
        { id: "loca2_2", text: "Wait for automatic ECCS activation to prevent operator error.", feedback: "Waiting for automatic activation may delay critical cooling response." },
        { id: "loca2_3", text: "Depressurize the system first to avoid thermal shock.", feedback: "Depressurization without cooling risks core damage." }
      ],
      correctAction: "loca2_1",
    },
    {
      situation: "Containment pressure is rising due to steam release from the break.",
      actions: [
        { id: "loca3_1", text: "Vent the containment to reduce pressure.", feedback: "Venting compromises containment integrity and should be avoided." },
        { id: "loca3_2", text: "Activate containment spray system to condense steam and reduce pressure.", feedback: "Containment spray reduces pressure while maintaining containment integrity." },
        { id: "loca3_3", text: "Seal the containment and allow pressure to stabilize naturally.", feedback: "Allowing uncontrolled pressure rise risks containment failure." }
      ],
      correctAction: "loca3_2",
    },
    {
      situation: "With initial actions taken, isolation of the leak is needed.",
      actions: [
        { id: "loca4_1", text: "Send maintenance team to manually close isolation valves near the suspected leak.", feedback: "Manual valve closure during emergency exposes personnel to radiation." },
        { id: "loca4_2", text: "Remotely close all primary loop segment isolation valves to identify pressure drop location.", feedback: "Closing all valves may interfere with emergency cooling flow paths." },
        { id: "loca4_3", text: "Continue with emergency cooling; leak isolation is secondary to maintaining core cooling.", feedback: "Maintaining core cooling is the priority until stable shutdown is achieved." }
      ],
      correctAction: "loca4_3",
    }
  ],
  parameters: [
    { name: "Core Temperature", value: "347", unit: "°C", status: "warning" },
    { name: "Primary Pressure", value: "10.2", unit: "MPa", status: "critical" },
    { name: "Coolant Flow", value: "42000", unit: "m³/h", status: "critical" },
    { name: "Containment Pressure", value: "108", unit: "kPa", status: "warning" },
    { name: "Radiation Level", value: "0.32", unit: "mSv/h", status: "warning" },
    { name: "ECCS Status", value: "Standby", unit: "", status: "normal" },
    { name: "Diesel Generators", value: "Ready", unit: "", status: "normal" },
    { name: "Offsite Power", value: "Available", unit: "", status: "normal" }
  ]
};

// Station Blackout Scenario
const blackoutScenario = {
  name: "Station Blackout",
  description: "Loss of all AC power supplies requiring emergency backup systems.",
  steps: [
    {
      situation: "All AC power sources have failed. External grid connection lost and in-house generators failed to start.",
      actions: [
        { id: "bo1_1", text: "Manually start backup diesel generators.", feedback: "Diesel generators should be started, but reactor safety is the first priority." },
        { id: "bo1_2", text: "Immediately initiate reactor SCRAM.", feedback: "Safety first - reactor must be shut down immediately." },
        { id: "bo1_3", text: "Contact grid operator to restore external power.", feedback: "External coordination is important but reactor safety comes first." }
      ],
      correctAction: "bo1_2",
    },
    {
      situation: "Reactor is shutting down. Cooling systems are losing power.",
      actions: [
        { id: "bo2_1", text: "Prioritize power to emergency core cooling systems.", feedback: "Prioritizing ECCS is important but natural circulation is more sustainable." },
        { id: "bo2_2", text: "Distribute limited battery power equally to all systems.", feedback: "Equal distribution doesn't prioritize critical cooling functions." },
        { id: "bo2_3", text: "Switch to natural circulation cooling mode and conserve battery power.", feedback: "Natural circulation reduces power needs while maintaining cooling." }
      ],
      correctAction: "bo2_3",
    },
    {
      situation: "Battery power is limited. Need to establish long-term cooling strategy.",
      actions: [
        { id: "bo3_1", text: "Deploy portable emergency generators to restore AC power to critical systems.", feedback: "Portable generators provide sustainable power for critical cooling." },
        { id: "bo3_2", text: "Reduce all non-essential power consumption to extend battery life.", feedback: "Power conservation helps but doesn't solve the long-term power need." },
        { id: "bo3_3", text: "Request emergency power from nearby facilities.", feedback: "External power may not be available quickly enough for emergency response." }
      ],
      correctAction: "bo3_1",
    },
    {
      situation: "Portable generators are connected. Need to manage fuel and cooling priorities.",
      actions: [
        { id: "bo4_1", text: "Restore full cooling capacity to all systems.", feedback: "Full restoration may exceed generator capacity and waste fuel." },
        { id: "bo4_2", text: "Establish minimum safe cooling levels and reserve fuel for extended operation.", feedback: "Fuel conservation is critical during extended blackout scenarios." },
        { id: "bo4_3", text: "Power communications systems to coordinate with external emergency response.", feedback: "Communications are important but core cooling takes priority." }
      ],
      correctAction: "bo4_2",
    }
  ],
  parameters: [
    { name: "Core Temperature", value: "330", unit: "°C", status: "warning" },
    { name: "Battery Capacity", value: "82", unit: "%", status: "warning" },
    { name: "Coolant Flow", value: "48000", unit: "m³/h", status: "warning" },
    { name: "Diesel Gen 1", value: "Failed", unit: "", status: "critical" },
    { name: "Diesel Gen 2", value: "Failed", unit: "", status: "critical" },
    { name: "Offsite Power", value: "Lost", unit: "", status: "critical" },
    { name: "Est. Battery Time", value: "4", unit: "hours", status: "warning" },
    { name: "Portable Generators", value: "Available", unit: "", status: "normal" }
  ]
};

// Containment Overpressure Scenario
const overpressureScenario = {
  name: "Containment Overpressure",
  description: "Excessive pressure building in the containment structure.",
  steps: [
    {
      situation: "Containment pressure is rising rapidly above normal operating levels. Potential hydrogen buildup detected.",
      actions: [
        { id: "op1_1", text: "Immediately vent the containment to atmosphere to reduce pressure.", feedback: "Venting should be the last resort as it compromises containment integrity." },
        { id: "op1_2", text: "Activate hydrogen recombiners to reduce hydrogen concentration.", feedback: "Hydrogen must be addressed first to prevent potential ignition." },
        { id: "op1_3", text: "Initiate reactor shutdown while investigating pressure source.", feedback: "Reactor shutdown is important but hydrogen poses immediate explosion risk." }
      ],
      correctAction: "op1_2",
    },
    {
      situation: "Hydrogen levels are being managed, but pressure continues to rise.",
      actions: [
        { id: "op2_1", text: "Conduct controlled venting through filters to reduce pressure.", feedback: "Controlled venting may be necessary but reactor shutdown should come first." },
        { id: "op2_2", text: "Increase containment cooling to reduce steam pressure.", feedback: "Containment cooling helps but may not address the root cause quickly enough." },
        { id: "op2_3", text: "SCRAM the reactor and initiate emergency cooling systems.", feedback: "Reactor shutdown is required when containment integrity is threatened." }
      ],
      correctAction: "op2_3",
    },
    {
      situation: "Investigation shows small steam leak in containment. Pressure stabilizing but still elevated.",
      actions: [
        { id: "op3_1", text: "Attempt to isolate and repair the steam leak immediately.", feedback: "Immediate repairs during emergency conditions may not be safe or effective." },
        { id: "op3_2", text: "Maintain current cooling strategy and monitor containment structural parameters.", feedback: "Monitoring is important but active pressure reduction is needed." },
        { id: "op3_3", text: "Reduce primary system pressure to minimize leak flow rate.", feedback: "Reducing primary pressure reduces leak flow while maintaining cooling." }
      ],
      correctAction: "op3_3",
    },
    {
      situation: "Pressure stabilized below design limits. Need to establish long-term management strategy.",
      actions: [
        { id: "op4_1", text: "Return reactor to power once containment pressure normalizes.", feedback: "Returning to power without addressing the leak cause is unsafe." },
        { id: "op4_2", text: "Prepare for controlled plant cooldown and maintenance outage.", feedback: "Cooldown is necessary to allow for inspection and repairs." },
        { id: "op4_3", text: "Vent containment completely to restore normal pressure.", feedback: "Complete venting may not be necessary and compromises containment integrity." }
      ],
      correctAction: "op4_2",
    }
  ],
  parameters: [
    { name: "Containment Pressure", value: "118", unit: "kPa", status: "critical" },
    { name: "Hydrogen Concentration", value: "2.8", unit: "%", status: "warning" },
    { name: "Core Temperature", value: "328", unit: "°C", status: "normal" },
    { name: "Primary Pressure", value: "15.4", unit: "MPa", status: "normal" },
    { name: "Containment Temp", value: "65", unit: "°C", status: "warning" },
    { name: "Containment Spray", value: "Standby", unit: "", status: "normal" },
    { name: "Filtered Vent", value: "Available", unit: "", status: "normal" },
    { name: "H2 Recombiners", value: "Available", unit: "", status: "normal" }
  ]
};

// Cyber Intrusion Scenario
const cyberScenario = {
  name: "Cyber Intrusion Alert",
  description: "Detection of unauthorized access to plant control systems.",
  steps: [
    {
      situation: "Security system has detected unauthorized access attempts to control system networks.",
      actions: [
        { id: "cy1_1", text: "Immediately disconnect all external network connections.", feedback: "Network disconnection is important but manual control ensures immediate safety." },
        { id: "cy1_2", text: "Run anti-malware scans while maintaining operations.", feedback: "Scans are important but don't address active threats to control systems." },
        { id: "cy1_3", text: "Switch to manual control of critical systems and investigate.", feedback: "Manual control ensures safety while assessment is conducted." }
      ],
      correctAction: "cy1_3",
    },
    {
      situation: "Multiple control systems showing unusual command patterns. Authentication logs show suspicious activity.",
      actions: [
        { id: "cy2_1", text: "Shut down all digital control systems and operate manually.", feedback: "Complete shutdown may be too drastic if backup systems are available." },
        { id: "cy2_2", text: "Activate backup control systems on isolated networks.", feedback: "Backup systems provide reliable control while maintaining operations." },
        { id: "cy2_3", text: "Reset affected systems to last known secure configuration.", feedback: "Resetting may not address active intrusions and could cause system instability." }
      ],
      correctAction: "cy2_2",
    },
    {
      situation: "Security team has identified compromised credentials. System stability needs to be maintained.",
      actions: [
        { id: "cy3_1", text: "Force password reset for all users while systems remain online.", feedback: "Password resets are important but don't stop active unauthorized sessions." },
        { id: "cy3_2", text: "Lock out all remote access and revoke current authentication tokens.", feedback: "Revoking access tokens prevents further unauthorized commands." },
        { id: "cy3_3", text: "Prepare for emergency shutdown if system control cannot be verified.", feedback: "Emergency shutdown is a last resort when other measures can maintain safety." }
      ],
      correctAction: "cy3_2",
    },
    {
      situation: "Intrusion contained but extent of compromise still unknown. Need to establish secure operations.",
      actions: [
        { id: "cy4_1", text: "Begin gradual return to digital control after preliminary security checks.", feedback: "Preliminary checks may not be sufficient to detect all compromise vectors." },
        { id: "cy4_2", text: "Maintain manual operations until full forensic analysis is complete.", feedback: "Full security verification is required before resuming digital control." },
        { id: "cy4_3", text: "Restore from clean backups after verifying hardware integrity.", feedback: "Backup restoration is important but manual operations ensure immediate safety." }
      ],
      correctAction: "cy4_2",
    }
  ],
  parameters: [
    { name: "Network Intrusion", value: "Multiple", unit: "alerts", status: "critical" },
    { name: "Auth Failures", value: "17", unit: "attempts", status: "critical" },
    { name: "Control Systems", value: "Manual", unit: "mode", status: "warning" },
    { name: "External Network", value: "Isolated", unit: "", status: "normal" },
    { name: "Core Parameters", value: "Stable", unit: "", status: "normal" },
    { name: "Safety Systems", value: "Unaffected", unit: "", status: "normal" },
    { name: "Backup Systems", value: "Ready", unit: "", status: "normal" },
    { name: "Physical Security", value: "Heightened", unit: "", status: "warning" }
  ]
};

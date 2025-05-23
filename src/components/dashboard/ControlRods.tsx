
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { setManualControlRodPosition } from "@/lib/simulationEngine";

interface ControlRodsProps {
  positions: number[];
  onPositionChange?: (index: number, position: number) => void;
}

export default function ControlRods({ positions, onPositionChange }: ControlRodsProps) {
  const [localPositions, setLocalPositions] = useState<number[]>(positions);

  // Update local positions when the parent component updates them
  useEffect(() => {
    setLocalPositions(positions);
  }, [positions]);

  const handlePositionChange = (index: number, value: number[]) => {
    const newPosition = value[0];
    const newPositions = [...localPositions];
    newPositions[index] = newPosition;
    setLocalPositions(newPositions);
    
    // Update the simulation engine
    setManualControlRodPosition(index, newPosition);
    
    // Notify parent component if callback is provided
    if (onPositionChange) {
      onPositionChange(index, newPosition);
    }
  };

  // React to insertion level with different colors
  const getRodColor = (position: number) => {
    if (position > 80) return "bg-nuclear-danger";
    if (position > 50) return "bg-nuclear-warning";
    return "bg-nuclear-success";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Control Rod Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center">
          {localPositions.map((position, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="control-rod-container">
                      <div
                        className={`control-rod ${getRodColor(position)}`}
                        style={{ height: `${position}%` }}
                      />
                    </div>
                    <div className="text-xs text-center font-medium">Rod {index + 1}</div>
                    <div className="w-40">
                      <Slider
                        value={[position]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => handlePositionChange(index, value)}
                      />
                    </div>
                    <div className="text-xs">{position}% Inserted</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Control Rod {index + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {position < 30
                      ? "Low insertion - higher reactivity"
                      : position < 70
                      ? "Moderate insertion - balanced reactivity"
                      : "High insertion - lower reactivity"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Adjust control rod insertion to regulate reactor power
        </p>
      </CardContent>
    </Card>
  );
}

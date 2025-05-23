
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GaugeProps {
  title: string;
  value: number;
  min: number;
  max: number;
  units?: string;
  danger?: number;
  warning?: number;
  success?: number;
  icon?: React.ReactNode;
  className?: string;
  lastUpdated?: Date;
}

export default function Gauge({
  title,
  value,
  min,
  max,
  units,
  danger,
  warning,
  success,
  icon,
  className = "",
  lastUpdated,
}: GaugeProps) {
  const [isUpdated, setIsUpdated] = useState(false);

  // Normalize value to percentage
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  // Determine color based on value and thresholds
  const getColor = () => {
    if (danger !== undefined && value >= danger) return "bg-nuclear-danger";
    if (warning !== undefined && value >= warning) return "bg-nuclear-warning";
    if (success !== undefined && value >= success) return "bg-nuclear-success";
    return "bg-blue-500";
  };

  const valueColor = () => {
    if (danger !== undefined && value >= danger) return "text-nuclear-danger";
    if (warning !== undefined && value >= warning) return "text-nuclear-warning";
    if (success !== undefined && value >= success) return "text-nuclear-success";
    return "";
  };

  // Animation effect when value updates
  useEffect(() => {
    setIsUpdated(true);
    const timer = setTimeout(() => setIsUpdated(false), 1500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card className={`${className} ${isUpdated ? "animate-data-update" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold mb-2 ${valueColor()}`}>
          {value.toLocaleString()}
          {units && <span className="text-sm font-normal text-muted-foreground ml-1">{units}</span>}
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5 mb-1">
          <div 
            className={`gauge-progress h-2.5 rounded-full ${getColor()}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}{units}</span>
          <span>{max}{units}</span>
        </div>

        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-3">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

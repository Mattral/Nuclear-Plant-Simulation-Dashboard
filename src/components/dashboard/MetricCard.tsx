
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  status?: "normal" | "warning" | "danger" | "success";
  lastUpdated?: Date;
  className?: string;
  tooltipContent?: React.ReactNode;
  withTooltip?: boolean;
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  description,
  status = "normal",
  lastUpdated,
  className = "",
  tooltipContent,
  withTooltip = true,
}: MetricCardProps) {
  const [isUpdated, setIsUpdated] = useState(false);

  // Style based on status
  let statusColor = "";
  switch (status) {
    case "warning":
      statusColor = "bg-nuclear-warning text-nuclear-warning-dark";
      break;
    case "danger":
      statusColor = "bg-nuclear-danger text-white";
      break;
    case "success":
      statusColor = "bg-nuclear-success text-white";
      break;
    default:
      statusColor = "bg-secondary text-secondary-foreground";
  }

  // Animation effect when value updates
  useEffect(() => {
    setIsUpdated(true);
    const timer = setTimeout(() => setIsUpdated(false), 1500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card className={`overflow-hidden ${className} ${isUpdated ? "animate-data-update" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            {title}
            {withTooltip && tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </div>
          {status !== "normal" && (
            <Badge variant="secondary" className={statusColor}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground mt-2">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

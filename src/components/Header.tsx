
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  setUserRole: (role: "Engineer" | "Operator" | "Analyst") => void;
  currentRole: "Engineer" | "Operator" | "Analyst";
}

export default function Header({ setUserRole, currentRole }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formattedTime = time.toLocaleTimeString();
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleRoleChange = (role: "Engineer" | "Operator" | "Analyst") => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  return (
    <header className="bg-card border-b border-border shadow-sm p-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-nuclear-blue flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-nuclear-success animate-pulse-slow"></div>
        </div>
        <h1 className="text-lg font-bold">Nuclear Simulation Dashboard</h1>
        <span className="hidden sm:inline text-sm text-muted-foreground">|</span>
        <span className="hidden sm:block badge bg-nuclear-success/20 text-nuclear-success-dark px-2 py-0.5 text-xs rounded-md">System Stable</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-right hidden md:block">
          <div className="font-medium">{formattedTime}</div>
          <div className="text-muted-foreground text-xs">{formattedDate}</div>
        </div>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-nuclear-blue-light text-white text-xs">
                  {currentRole.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{currentRole}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleRoleChange("Engineer")}>
              Engineer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("Operator")}>
              Operator
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("Analyst")}>
              Analyst
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

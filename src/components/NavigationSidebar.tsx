
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Activity, BarChart3, GaugeCircle, Settings, AlertTriangle, FileBarChart, Radiation } from "lucide-react";

interface NavigationSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

export default function NavigationSidebar({ activeTab, setActiveTab, userRole }: NavigationSidebarProps) {
  const menuItems = [
    { id: "overview", title: "Plant Overview", icon: Activity, roles: ["Engineer", "Operator", "Analyst"] },
    { id: "energy-mix", title: "Energy Mix", icon: GaugeCircle, roles: ["Engineer", "Operator", "Analyst"] },
    { id: "thermal", title: "Thermal Efficiency", icon: BarChart3, roles: ["Engineer", "Operator", "Analyst"] },
    { id: "waste", title: "Waste Management", icon: Radiation, roles: ["Engineer", "Analyst"] },
    { id: "emergency", title: "Emergency Drill", icon: AlertTriangle, roles: ["Engineer", "Operator"] },
    { id: "reporting", title: "Reporting", icon: FileBarChart, roles: ["Engineer", "Analyst"] },
    { id: "settings", title: "Settings", icon: Settings, roles: ["Engineer", "Operator", "Analyst"] },
  ];

  // Filter menu items based on user role
  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

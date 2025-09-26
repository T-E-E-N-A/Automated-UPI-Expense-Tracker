import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { DollarSign, Home, LogOut, TrendingDown, TrendingUp, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Expenses", url: "/expenses", icon: TrendingDown },
  { title: "Income", url: "/income", icon: TrendingUp },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path) => currentPath === path;
  const getNavCls = ({ isActive }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  const handleLogout = async() => {
    localStorage.removeItem("isAuthenticated");  // dummy
    window.location.href = "/login"; 
    try {
    await fetch(`${process.env.REACT_APP_backendUrl}/api/logout`, {
      method: "POST",
      credentials: "include", // ensures cookie is sent/cleared
    });

    // Clear client-side state if any
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  } catch (err) {
    console.error("Logout failed:", err);
  }
  };

  return (
    <Sidebar className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300`}>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">ExpenseTracker</h2>
              <p className="text-xs text-muted-foreground">Personal Finance</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col flex-1">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 p-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User section at bottom */}
        <div className="p-4 border-t mt-auto">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Deeksha Agarwal</p>
                  <p className="text-xs text-muted-foreground truncate">deeksha@example.com</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Avatar className="w-8 h-8 mx-auto">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="w-full p-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Calendar, Dumbbell, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface SidebarProps {
  isMobile?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  isMobile = false,
  isOpen,
  onToggle
}: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Gestisce il logout
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Elementi di navigazione della sidebar
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Clients", icon: Users, href: "/patients" },
    { label: "Schedule", icon: Calendar, href: "/coach-schedule" },
    { label: "Exercises", icon: Dumbbell, href: "/exercises" },
    { label: "Settings", icon: Settings, href: "/settings" }
  ];
  
  return (
    <aside 
      className={cn(
        "bg-background h-screen border-r transition-all duration-300", 
        isOpen ? "w-64" : "w-16", 
        isMobile && "w-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-center items-center" />

        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.href}>
                <NavLink 
                  to={item.href} 
                  className={({isActive}) => cn(
                    "flex items-center gap-4 px-3 py-2 rounded-md transition-colors", 
                    "hover:bg-accent hover:text-accent-foreground", 
                    isActive ? "bg-accent text-accent-foreground" : "text-foreground/60",
                    !isOpen && !isMobile && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {(isOpen || isMobile) && <span className="text-sm">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout} 
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm text-foreground/60 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
              !isOpen && !isMobile && "justify-center w-full"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(isOpen || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

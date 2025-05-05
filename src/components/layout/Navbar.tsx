/**
 * Componente Navbar
 * 
 * Questo componente rappresenta la barra di navigazione principale dell'applicazione.
 * Fornisce accesso al menu utente, alle notifiche e contiene il logo dell'applicazione.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Bell, Menu as MenuIcon, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
interface NavbarProps {
  onToggleSidebar?: () => void;
}
export default function Navbar({
  onToggleSidebar
}: NavbarProps) {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  const handleToggleSidebar = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };
  return <header className="fixed top-0 left-0 right-0 h-12 xs:h-14 sm:h-16 bg-background z-40 border-b flex items-center px-4 gap-3">
      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar isMobile={true} isOpen={true} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Logo - Now acts as sidebar toggle on desktop */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggleSidebar}>
        <div className="bg-[#3b82f6] text-white h-8 w-8 rounded-lg flex items-center justify-center font-bold">
          K
        </div>
        <span className="font-semibold text-lg hidden xs:block">ALOS</span>
      </div>

      <div className="flex-1"></div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="text-sm">No new notifications</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 relative rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="cursor-pointer flex w-full items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>;
}
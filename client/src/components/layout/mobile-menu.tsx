import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Home, Users, Settings, BarChart3, Code, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileMenu = () => {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5 mr-3" />, label: "Dashboard" },
    { path: "/subscribers", icon: <Users className="h-5 w-5 mr-3" />, label: "Subscribers" },
    { path: "/settings", icon: <Settings className="h-5 w-5 mr-3" />, label: "Settings" },
    { path: "/analytics", icon: <BarChart3 className="h-5 w-5 mr-3" />, label: "Analytics" },
    { path: "/integration", icon: <Code className="h-5 w-5 mr-3" />, label: "Integration" },
    { path: "/documentation", icon: <FileText className="h-5 w-5 mr-3" />, label: "Documentation" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">Waitlist SDK</h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Waitlist SDK</h1>
              <button 
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        location === item.path
                          ? "text-primary bg-indigo-50"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.path);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;

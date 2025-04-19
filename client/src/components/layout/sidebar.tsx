import { useLocation } from "wouter";
import { Home, Users, Settings, BarChart3, Code, FileText, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  user: any;
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      navigate("/login");
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5 mr-3" />, label: "Dashboard" },
    { path: "/subscribers", icon: <Users className="h-5 w-5 mr-3" />, label: "Subscribers" },
    { path: "/settings", icon: <Settings className="h-5 w-5 mr-3" />, label: "Settings" },
    { path: "/analytics", icon: <BarChart3 className="h-5 w-5 mr-3" />, label: "Analytics" },
    { path: "/integration", icon: <Code className="h-5 w-5 mr-3" />, label: "Integration" },
    { path: "/documentation", icon: <FileText className="h-5 w-5 mr-3" />, label: "Documentation" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:flex flex-col hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Waitlist SDK</h1>
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
                  navigate(item.path);
                }}
              >
                {item.icon}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || user?.username}</p>
            <p className="text-xs font-medium text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

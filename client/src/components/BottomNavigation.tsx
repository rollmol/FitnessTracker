import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Dumbbell, ChartLine, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/workouts", icon: Dumbbell, label: "Workouts" },
    { path: "/progress", icon: ChartLine, label: "Progress" },
    { path: "/badges", icon: User, label: "Profile" }, // Using badges as profile for now
  ];

  return (
    <div className="bottom-nav">
      <div className="flex justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-4 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setLocation(path)}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

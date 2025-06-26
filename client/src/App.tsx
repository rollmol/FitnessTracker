import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import WorkoutSelection from "@/pages/WorkoutSelection";
import ActiveWorkout from "@/pages/ActiveWorkout";
import Progress from "@/pages/Progress";
import Badges from "@/pages/Badges";
import BottomNavigation from "@/components/BottomNavigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="mobile-container">
      {/* Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-three-quarters text-xs"></i>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pb-16"> {/* Add bottom padding for navigation */}
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/workouts" component={WorkoutSelection} />
          <Route path="/workout/:id" component={ActiveWorkout} />
          <Route path="/progress" component={Progress} />
          <Route path="/badges" component={Badges} />
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="stylesheet" 
        />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

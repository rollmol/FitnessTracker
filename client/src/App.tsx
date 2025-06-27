import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useCurrentUser } from "@/contexts/UserContext";
import Dashboard from "@/pages/Dashboard";
import WorkoutSelection from "@/pages/WorkoutSelection";
import ActiveWorkout from "@/pages/ActiveWorkout";
import Progress from "@/pages/Progress";
import Badges from "@/pages/Badges";
import Onboarding from "@/pages/Onboarding";
import BottomNavigation from "@/components/BottomNavigation";
import NotFound from "@/pages/not-found";

function Router() {
  const { currentUser, isLoading } = useCurrentUser();

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur → Onboarding
  if (!currentUser) {
    return <Onboarding />;
  }

  // Si utilisateur existe → App normale
  return (
    <div className="mobile-container">
      {/* Status Bar - SUPPRIMÉ */}
      
      {/* Main Content */}
      <div className="pb-16">
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
        <UserProvider>
          <link 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
            rel="stylesheet" 
          />
          <Toaster />
          <Router />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
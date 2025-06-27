import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Dumbbell, Clock, Flame } from "lucide-react";

interface WorkoutProgram {
  id: number;
  name: string;
  description: string;
  type: string;
  estimatedDuration: number;
  exercises: string[];
}

export default function WorkoutSelection() {
  const [, setLocation] = useLocation();

  const { data: programs, isLoading } = useQuery<WorkoutProgram[]>({
    queryKey: ["/api/workout-programs"],
  });

  // Weekly workout schedule matching Dashboard
  const weeklySchedule = [
    { day: 0, name: "Repos", programId: null }, // Dimanche
    { day: 1, name: "Haut du corps A - Force", programId: 1 }, // Lundi
    { day: 2, name: "Bas du corps A - Force", programId: 2 }, // Mardi
    { day: 3, name: "Repos", programId: null }, // Mercredi
    { day: 4, name: "Haut du corps B - Volume", programId: 3 }, // Jeudi
    { day: 5, name: "Bas du corps B - Explosivité", programId: 4 }, // Vendredi
    { day: 6, name: "Repos", programId: null }, // Samedi
  ];

  const today = new Date().getDay();
  const todaysSchedule = weeklySchedule.find(schedule => schedule.day === today);
  const todaysWorkout = todaysSchedule?.programId ? programs?.find(p => p.id === todaysSchedule.programId) : null;

  const getIntensityLabel = (type: string) => {
    switch (type) {
      case "force":
        return "Intensité élevée";
      case "volume":
        return "Intensité moyenne";
      case "explosivity":
        return "Intensité très élevée";
      default:
        return "Intensité moyenne";
    }
  };

  const getProgramScheduleInfo = (programId: number) => {
    const scheduleEntry = weeklySchedule.find(s => s.programId === programId);
    if (!scheduleEntry) return { dayName: "Disponible", isToday: false, dayIndex: -1 };
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return {
      dayName: dayNames[scheduleEntry.day],
      isToday: scheduleEntry.day === today,
      dayIndex: scheduleEntry.day
    };
  };

  const getIntensityColor = (type: string) => {
    switch (type) {
      case "force":
        return "text-red-500";
      case "volume":
        return "text-orange-500";
      case "explosivity":
        return "text-red-600";
      default:
        return "text-orange-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des entraînements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4 p-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-semibold">Choisir un entraînement</h1>
      </div>

      {/* Today's Recommended Workout */}
      {todaysWorkout && (
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Entraînement recommandé aujourd'hui</h2>
          <Card className="shadow-md border-2 border-blue-500 bg-blue-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900">
                  {todaysWorkout.name}
                </h3>
                <Badge className="bg-blue-500 text-white">
                  Aujourd'hui
                </Badge>
              </div>
              <p className="text-blue-800 text-sm mb-4">{todaysWorkout.description}</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-blue-700">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{todaysWorkout.estimatedDuration} min</span>
                </div>
                <div className="flex items-center">
                  <Flame className={`h-4 w-4 mr-1 ${getIntensityColor(todaysWorkout.type)}`} />
                  <span className={`text-sm ${getIntensityColor(todaysWorkout.type)}`}>
                    {getIntensityLabel(todaysWorkout.type)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setLocation(`/workout/${todaysWorkout.id}`)}
              >
                Commencer l'entraînement du jour
              </Button>
            </div>
          </Card>
        </div>
      )}

      {todaysSchedule && !todaysWorkout && (
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Aujourd'hui</h2>
          <Card className="shadow-md border-2 border-green-500 bg-green-50">
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Jour de repos</h3>
              <p className="text-green-800 text-sm mb-4">
                Profitez de ce jour pour récupérer. La récupération est essentielle pour progresser !
              </p>
              <Badge className="bg-green-500 text-white">
                Repos planifié
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* All Workout Programs */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tous les programmes</h2>
        <div className="space-y-4">
          {programs?.map((program) => {
            const scheduleInfo = getProgramScheduleInfo(program.id);
            return (
              <Card
                key={program.id}
                className={`shadow-sm border-2 transition-colors cursor-pointer ${
                  scheduleInfo.isToday 
                    ? "border-blue-300 bg-blue-50" 
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setLocation(`/workout/${program.id}`)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-lg font-semibold ${
                      scheduleInfo.isToday ? "text-blue-900" : "text-gray-800"
                    }`}>
                      {program.name}
                    </h3>
                    <Badge
                      variant={scheduleInfo.isToday ? "default" : "secondary"}
                      className={scheduleInfo.isToday ? "bg-blue-500" : "bg-gray-100 text-gray-600"}
                    >
                      {scheduleInfo.isToday ? "Aujourd'hui" : scheduleInfo.dayName}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {program.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Dumbbell className="w-4 h-4 mr-1" />
                      {program.exercises?.length || 6} exercices
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.estimatedDuration}-{program.estimatedDuration + 15} min
                    </span>
                    <span className={`flex items-center ${getIntensityColor(program.type)}`}>
                      <Flame className="w-4 h-4 mr-1" />
                      {getIntensityLabel(program.type)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
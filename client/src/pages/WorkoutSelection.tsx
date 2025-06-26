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

  const getDayLabel = (index: number) => {
    const days = ["Aujourd'hui", "Demain", "Mer", "Jeu"];
    return days[index] || "Disponible";
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

      {/* Workout Programs */}
      <div className="p-6">
        <div className="space-y-4">
          {programs?.map((program, index) => (
            <Card
              key={program.id}
              className="shadow-sm border-2 border-transparent hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setLocation(`/workout/${program.id}`)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {program.name}
                  </h3>
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className={index === 0 ? "bg-blue-500" : "bg-gray-100 text-gray-600"}
                  >
                    {getDayLabel(index)}
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">
                  {program.description}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    {program.exercises?.length || 6} exercises
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
          ))}
        </div>
      </div>
    </div>
  );
}

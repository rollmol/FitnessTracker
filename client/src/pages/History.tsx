import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp, Filter } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/contexts/UserContext";

interface WorkoutSession {
  id: number;
  programId: number;
  startTime: string;
  endTime: string;
  status: string;
  totalVolume: number;
  averageRpe: number;
}

interface WorkoutProgram {
  id: number;
  name: string;
  description: string;
}

interface WorkoutSet {
  id: number;
  sessionId: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  restTime: number;
}

interface Exercise {
  id: number;
  name: string;
}

export default function History() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id || 1;

  const { data: sessions } = useQuery<WorkoutSession[]>({
    queryKey: [`/api/users/${userId}/workout-sessions`],
  });

  const { data: programs } = useQuery<WorkoutProgram[]>({
    queryKey: ["/api/workout-programs"],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: allSets } = useQuery<WorkoutSet[]>({
    queryKey: [`/api/users/${userId}/workout-sets`],
  });

  const getWorkoutName = (programId: number) => {
    return programs?.find(p => p.id === programId)?.name || "Entraînement inconnu";
  };

  const getExerciseName = (exerciseId: number) => {
    return exercises?.find(e => e.id === exerciseId)?.name || "Exercice inconnu";
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    return `${duration} min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSessionSets = (sessionId: number) => {
    return allSets?.filter(set => set.sessionId === sessionId) || [];
  };

  const filteredSessions = sessions?.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) || [];

  const totalWorkouts = sessions?.filter(s => s.status === 'completed').length || 0;
  const totalVolume = sessions?.reduce((sum, s) => sum + (s.totalVolume || 0), 0) || 0;
  const avgDuration = sessions?.length > 0 
    ? sessions
        .filter(s => s.endTime)
        .reduce((sum, s) => {
          const duration = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60);
          return sum + duration;
        }, 0) / sessions.filter(s => s.endTime).length
    : 0;

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
        <h1 className="text-xl font-semibold">Historique des entraînements</h1>
      </div>

      <div className="p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="gradient-primary text-white p-4 text-center">
            <Dumbbell className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <div className="text-sm text-blue-100">Séances</div>
          </Card>
          
          <Card className="gradient-secondary text-white p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(totalVolume / 1000)}K</div>
            <div className="text-sm text-green-100">Volume (kg)</div>
          </Card>
          
          <Card className="gradient-accent text-white p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(avgDuration)}</div>
            <div className="text-sm text-orange-100">Durée moy. (min)</div>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Toutes ({sessions?.length || 0})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
            className="flex-1"
          >
            Terminées ({sessions?.filter(s => s.status === 'completed').length || 0})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
            className="flex-1"
          >
            Annulées ({sessions?.filter(s => s.status === 'cancelled').length || 0})
          </Button>
        </div>

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-4 mb-20">
            {filteredSessions.map((session) => {
              const sessionSets = getSessionSets(session.id);
              const uniqueExercises = [...new Set(sessionSets.map(set => set.exerciseId))];
              
              return (
                <Card key={session.id} className="shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{getWorkoutName(session.programId)}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.startTime)}</span>
                        <span>•</span>
                        <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={session.status === 'completed' ? 'default' : 'secondary'}
                      className={session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
                    >
                      {session.status === 'completed' ? 'Terminée' : 'Annulée'}
                    </Badge>
                  </div>

                  {session.status === 'completed' && (
                    <>
                      {/* Session Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{uniqueExercises.length}</div>
                          <div className="text-xs text-gray-500">Exercices</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{sessionSets.length}</div>
                          <div className="text-xs text-gray-500">Séries</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-500">
                            {session.totalVolume ? `${Math.round(session.totalVolume / 1000)}K` : '0'}
                          </div>
                          <div className="text-xs text-gray-500">Volume (kg)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {session.endTime ? formatDuration(session.startTime, session.endTime) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Durée</div>
                        </div>
                      </div>

                      {/* Exercise Details */}
                      {sessionSets.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Détail des exercices:</h4>
                          {uniqueExercises.map(exerciseId => {
                            const exerciseSets = sessionSets.filter(set => set.exerciseId === exerciseId);
                            const maxWeight = Math.max(...exerciseSets.map(set => set.weight));
                            const totalReps = exerciseSets.reduce((sum, set) => sum + set.reps, 0);
                            
                            return (
                              <div key={exerciseId} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{getExerciseName(exerciseId)}</span>
                                <div className="flex items-center space-x-3 text-gray-600">
                                  <span>{exerciseSets.length} séries</span>
                                  <span>•</span>
                                  <span>{totalReps} reps</span>
                                  <span>•</span>
                                  <span className="font-medium text-blue-600">{maxWeight} kg max</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-sm p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'Aucun entraînement' : `Aucun entraînement ${filter === 'completed' ? 'terminé' : 'annulé'}`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Commencez votre premier entraînement pour voir votre historique ici !'
                : 'Aucun entraînement trouvé avec ce filtre.'
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => setLocation("/workouts")}>
                Commencer votre premier entraînement
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
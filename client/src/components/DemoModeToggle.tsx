import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube, User } from "lucide-react";

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: (isDemoMode: boolean) => void;
}

export default function DemoModeToggle({ isDemoMode, onToggle }: DemoModeToggleProps) {
  return (
    <Card className="p-4 mb-4 border-2 border-dashed border-orange-300 bg-orange-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isDemoMode ? (
            <TestTube className="h-5 w-5 text-orange-600" />
          ) : (
            <User className="h-5 w-5 text-blue-600" />
          )}
          <div>
            <div className="font-semibold text-gray-800">
              {isDemoMode ? "Mode Démo" : "Mode Réel"}
            </div>
            <div className="text-sm text-gray-600">
              {isDemoMode 
                ? "Les données ne seront pas sauvegardées" 
                : "Toutes les données sont sauvegardées"
              }
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isDemoMode ? "default" : "secondary"}>
            {isDemoMode ? "Test" : "Réel"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(!isDemoMode)}
            className="border-orange-400 text-orange-600 hover:bg-orange-100"
          >
            Basculer
          </Button>
        </div>
      </div>
      {isDemoMode && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-100 rounded p-2">
          <strong>Mode test activé :</strong> Vous pouvez tester toutes les fonctionnalités sans affecter vos vraies statistiques.
        </div>
      )}
    </Card>
  );
}
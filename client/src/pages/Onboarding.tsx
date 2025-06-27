import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Target, ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";



interface OnboardingData {
  name: string;
  age?: number;
  fitnessGoal: string;
}

export default function Onboarding() {
  const { updateCurrentUser } = useCurrentUser(); // ← AJOUTEZ CETTE LIGNE
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    age: undefined,
    fitnessGoal: "strength"
  });
  const [isLoading, setIsLoading] = useState(false);

  const fitnessGoals = [
    { id: "strength", label: "Gagner en force", icon: "💪" },
    { id: "muscle", label: "Prendre du muscle", icon: "🏋️" },
    { id: "endurance", label: "Améliorer l'endurance", icon: "🏃" },
    { id: "general", label: "Forme générale", icon: "✨" }
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    
    try {
		// ← AJOUTEZ CES LIGNES DE DEBUG
		const payload = {
		  username: formData.name.toLowerCase().replace(/\s+/g, ''),
		  name: formData.name
		};
		// ← FIN DES LIGNES DE DEBUG
		
      // Créer l'utilisateur via l'API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.name.toLowerCase().replace(/\s+/g, ''), // Générer un username depuis le nom
          name: formData.name
        })
      });
	  

      if (response.ok) {
        const user = await response.json();
        
		updateCurrentUser({
		  id: user.id,
		  name: user.name,
		  isOnboarded: true
		});
      } else {
        const errorData = await response.text();
        alert("Erreur lors de la création du profil. Vérifiez la console.");
      }
    } catch (error) {
      alert("Erreur de connexion. Vérifiez que le serveur fonctionne.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-blue-600 h-8 w-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Bienvenue sur Fitness Tracker !
            </h1>
            <p className="text-gray-600 mb-6">
              Commençons par créer votre profil pour personnaliser votre expérience.
            </p>

            <div className="space-y-4 text-left">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Votre prénom
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ex: Alex"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Âge (optionnel)
                </label>
                <input
                  id="age"
                  type="number"
                  placeholder="Ex: 25"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({...formData, age: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button 
              className="w-full mt-6"
              onClick={() => setStep(2)}
              disabled={!formData.name.trim()}
            >
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <div className="p-6 text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-orange-600 h-8 w-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Quel est votre objectif ?
          </h2>
          <p className="text-gray-600 mb-6">
            Cela nous aidera à personnaliser vos programmes d'entraînement.
          </p>

          <div className="space-y-3 mb-6">
            {fitnessGoals.map((goal) => (
              <button
                key={goal.id}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  formData.fitnessGoal === goal.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
                onClick={() => setFormData({...formData, fitnessGoal: goal.id})}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="font-medium text-gray-800">{goal.label}</span>
                </div>
              </button>
            ))}
          </div>

          <Button 
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Création du profil..." : "Commencer l'aventure !"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
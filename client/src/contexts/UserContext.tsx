import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrentUser {
  id: number;
  name: string;
  isOnboarded: boolean;
}

interface UserContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  updateCurrentUser: (user: CurrentUser) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  useEffect(() => {
    
    const userId = localStorage.getItem("fitness_user_id");
    const userName = localStorage.getItem("fitness_user_name");
    const isOnboarded = localStorage.getItem("fitness_onboarding_completed");


    if (userId && userName && isOnboarded) {
      const user = {
        id: parseInt(userId),
        name: userName,
        isOnboarded: true
      };
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
    
    setIsLoading(false);
  }, [refreshTrigger]);

  const updateCurrentUser = (user: CurrentUser) => {
    
    // Sauvegarder en localStorage
    localStorage.setItem("fitness_user_id", user.id.toString());
    localStorage.setItem("fitness_user_name", user.name);
    localStorage.setItem("fitness_onboarding_completed", "true");
    
    
    // Déclencher un refresh du useEffect
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <UserContext.Provider value={{ currentUser, isLoading, updateCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
}
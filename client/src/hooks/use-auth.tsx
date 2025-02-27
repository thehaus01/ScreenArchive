
import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

// Define a minimal user type that matches what the components expect
type User = {
  id: number;
  username: string;
  isAdmin: string | boolean;
};

// Create a context with default values
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: {
    mutateAsync: (data: any) => Promise<any>;
    isPending: boolean;
  };
  logout: () => Promise<void>;
};

// Create an Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // With auth disabled, create a dummy admin user
  const dummyUser = {
    id: 1,
    username: "user",
    isAdmin: true,
  };
  
  // Simplified auth state now that authentication is removed
  const authState = {
    user: dummyUser,
    isLoading: false,
    error: null,
    loginMutation: {
      mutateAsync: async (data: any) => Promise.resolve(dummyUser),
      isPending: false,
    },
    logout: async () => {
      // No-op function since we're not really logging out
      return Promise.resolve();
    },
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}

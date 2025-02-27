import { createContext, useContext, ReactNode } from "react";

// Create a dummy auth context
interface AuthContextType {
  user: null;
  isLoading: boolean;
  loginMutation: { mutateAsync: () => Promise<void>; isPending: boolean };
  logoutMutation: { mutate: () => void; isPending: boolean };
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  loginMutation: {
    mutateAsync: async () => {
      console.log("Authentication is disabled");
    },
    isPending: false,
  },
  logoutMutation: {
    mutate: () => {
      console.log("Authentication is disabled");
    },
    isPending: false,
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simply provide the default context
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
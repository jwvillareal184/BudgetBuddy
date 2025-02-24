import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true); // Start loading

      const { data } = await supabase.auth.getSession(); // Check if session exists
      if (data.session?.user) {
        await fetchUserData(data.session.user.id);
      }

      setLoading(false); // Stop loading
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (data) {
      setUser({ id: data.id, email: data.email });
    } else {
      console.error("Error fetching user:", error?.message);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login error:", error.message);
      return false;
    }

    if (data?.user) {
      fetchUserData(data.user.id);
      return true;
    }

    return false;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
  
    setUser(null); // Ensure state updates
    window.location.href = "/"; // Force redirect to login
  };
  

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {!loading && children} {/* Prevent rendering before session is checked */}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

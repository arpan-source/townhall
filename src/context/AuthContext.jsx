import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  console.log("✅ AuthProvider Mounted");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

console.log(data);
console.log(error);
    console.log("Fetching profile for:", userId);

const {
  data: { user },
} = await supabase.auth.getUser();

console.log("Authenticated user:", user);
    
    setProfile(data);
  }

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
   
    return () => subscription.unsubscribe();
  }, []);

//   async function login(email, password) {
//     return await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//   }
async function login(email, password) {
  console.log("Trying login:", email);

  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log(result);

  return result;
}

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

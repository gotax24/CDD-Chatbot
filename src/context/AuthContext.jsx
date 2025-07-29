
import { useState, useEffect, createContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: userProfile, error: errorProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(userProfile);

        const { data: userRole, error: errorRoles } = await supabase
        .rpc("get_user_role");
        setRole(userRole);

      } else {
        setProfile(null);
        setRole([]);
      }
      setLoading(false);
    };

    setupUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Si el estado de auth cambia, vuelve a configurar todo
        setSession(session);
        if (!session) {
          setProfile(null);
          setRole([]);
        } else {
          // Vuelve a llamar a la configuración si la sesión cambia
          setupUser();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = { session, profile, role, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

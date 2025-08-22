import { useState, useEffect, createContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    session: null,
    profile: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupUser = async (session) => {
      if (!session?.user) {
        setUser({
          session: null,
          profile: null,
        });
        setLoading(false);
        return;
      }
      // Perfil en tabla
      const { data: profile, error: errorProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser({
        session,
        profile: errorProfile ? null : profile,
      });

      setLoading(false);
    };

    // Llamada inicial
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await setupUser(session);
    };

    init();

    // Suscripción a cambios en auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setupUser(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

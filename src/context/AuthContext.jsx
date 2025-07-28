import { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        //Busca el perfil del usuario
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(userProfile);

        //Busca el rol del usuario
        const { data: userRole } = await supabase
          .from("users_roles")
          .select("roles(name)")
          .eq("user_id", session.user.id)
          .single();

        // Si el usuario tiene un rol, lo guardamos. Si no, queda como null.
        setRole(userRole ? userRole.roles.name : null);
      }
      setLoading(false);
    };

    fetchSessionData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(userProfile);

          // AÑADIDO: También busca el rol al cambiar la sesión
          const { data: userRole } = await supabase
            .from("users_roles")
            .select("roles(name)")
            .eq("user_id", session.user.id)
            .single();
          setRole(userRole ? userRole.roles.name : null);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
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

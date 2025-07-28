import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();

  if (!session) {
    // Si no hay sesión, lo redirigimos a la página de inicio de sesión
    return <Navigate to="/" />;
  }

  // Si hay sesión, mostramos el componente que envolvía
  return children;
};

export default ProtectedRoute;

import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    const getReports = async () => {
      const { data, error } = await supabase
        .from("medical_reports_view")
        .select("*");

      if (error) {
        console.error("Error al obtener informes:", error.message);
        setLoading(false);
      } else {
        setReports(data);
      }
      setLoading(false);
    };

    getReports();
  }, []);

  if (user.profile.role !== "admin") {
    return <Navigate to="/app/home" replace />;
  }

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <span>icono</span>
        <h1>Gestión de informes</h1>
      </header>
      <main>
        <button>Subir Informes en Lote</button>
        <button>Asignar Informe a Paciente</button>
        <table>
          <thead>
            <tr>
              <th>ID del Informe</th>
              <th>Paciente</th>
              <th>Cédula del Paciente</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>

                <td>
                  {report.patients
                    ? `${report.patients.first_name} ${report.patients.last_name}`
                    : "N/A"}
                </td>
                <td>{report.patients ? report.patients.personal_id : "N/A"}</td>
                <td>{report.state}</td>
                <td>
                  <button>Ver Detalles</button>
                  <button>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default ReportsManagement;

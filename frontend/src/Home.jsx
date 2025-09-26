import { useState, useEffect } from "react";
import useAuth from "./hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "./supabaseClient";
import Loading from "./components/Loading";
import "./Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState({
    reports: [],
    patients: [],
    deliveries: [],
    pending: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const date = new Date();
  const formattedDate = format(date, "PPPP", { locale: es });

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: deliveriesData, error: deliveriesError } = await supabase
          .from("deliveries")
          .select("*");
        const { data: reportsData, error: reportsError } = await supabase
          .from("medical_reports")
          .select("*");
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("*");

        const { data: pendingReports, error: pendingReportsError } =
          await supabase
            .from("medical_reports")
            .select(
              "id, original_filename, card_id, patients(first_name, last_name)"
            )
            .eq("state", "pending");

        if (
          deliveriesError ||
          reportsError ||
          patientsError ||
          pendingReportsError
        ) {
          console.log(
            deliveriesError ||
              patientsError ||
              reportsError ||
              pendingReportsError
          );
          setLoading(false);
          setError("Error al cargar las peticiones");
          return;
        }
        console.log("Datos traidos");
        setData({
          deliveries: deliveriesData,
          reports: reportsData,
          patients: patientsData,
          pending: pendingReports,
        });
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error(error);
        console.log("No se pudieron cargar los informes enviados");
      }
    };

    getData();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <>
      <header className="header-home">
        <div className="welcome-message">
          <h1 className="title-home">
            Bienvenido {user?.profile?.first_name} {user?.profile?.last_name} al
            portal de CDD Maracaibo
          </h1>
        </div>
        <div className="date-info">
          <p>Hoy es {formattedDate}</p>
        </div>
      </header>
      <main className="main-home">
        <section className="section-home-info">
          <p>Informes enviados: {data?.deliveries?.length}</p>
          <p>Informes subidos: {data?.reports?.length}</p>
          <p>Pacientes registrados: {data?.patients?.length}</p>
        </section>
        <section className="section-home-links">
          <h2 className="subtitle-home">Accesos rápidos</h2>
          <div className="div-home-links">
            <nav>
              <ul>
                <li>
                  <Link to="/app/reports">Enviar informes medicos</Link>
                </li>
                <li>
                  <Link to="/app/admin/patients">Crear un paciente</Link>
                </li>
                <li>
                  <Link to="/app/admin/reports">Subir Informes</Link>
                </li>
              </ul>
            </nav>
          </div>
        </section>
        <section className="section-home-pending">
          <h2>Informes pendientes</h2>
          {data?.pending?.length === 0 ? (
            <p className="message-pending">
              🥳 Felicitaciones no hay informes pendientes
            </p>
          ) : (
            <ol className="ol-pending">
              {data?.pending.map((report) => (
                <li key={report?.id}>
                  nombre: {report?.original_filename} - paciente:{" "}
                  {report?.patients?.first_name} {report.patients?.last_name} -
                  cédula: {report?.card_id}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/*Una grafica para determinar los deliverys  */}

        {error && <p className="error-home-message">{error}</p>}
      </main>
    </>
  );
};

export default Home;

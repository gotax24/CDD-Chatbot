import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliverys = async () => {
      const { data, error } = await supabase.from("deliverys").select("*");
      if (error) {
        console.error("Error al traer los deliverys ", error);
        console.log(error);
        setLoading(false);
        return;
      }

      setReports(data);
      setLoading(false);
      console.log("deliverys entregado correctamente");
    };

    fetchDeliverys();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <header>
        <h1>Informes</h1>
      </header>
      <main>
        <nav>
          <Link>Gestion de informes</Link>
          <Link>Gestion de pacientes</Link>
          <button onClick={"open modal"}>Enviar informes</button>
        </nav>
        <h2>Informes enviados</h2>
        <ol>
          {reports ? (
            reports.map((report) => {
              return <li key={report.id}>{report.title}</li>;
            })
          ) : (
            <p>No hay informes enviados aun</p>
          )}
        </ol>
      </main>
    </>
  );
};

export default Report;

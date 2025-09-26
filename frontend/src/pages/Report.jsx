import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import useModalManager from "../hooks/useModalState";
import FormReportSend from "../components/FormReportSend";
import Modal from "../components/Modal";
import reportIcon from "../assets/menu/report.svg";
import "../css/Page.css";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, closeModal, openModal } = useModalManager();

  useEffect(() => {
    const fetchDeliverys = async () => {
      const { data, error } = await supabase.from("deliveries").select("*");
      if (error) {
        console.error("Error al traer los deliverys ", error);
        setLoading(false);
        return;
      }
      setReports(data);
      setLoading(false);
    };

    fetchDeliverys();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <header className="header-page header-inline">
        <img src={reportIcon} alt="Icono de informes" className="icon-page" />
        <h1 className="title-page">Gestión de Informes</h1>
      </header>

      <main className="main-page">
        <nav className="nav-page">
          <Link className="link-page" to="/app/admin/reports">
            Gestión de informes
          </Link>
          <Link className="link-page" to="/app/admin/patients">
            Gestión de pacientes
          </Link>
          <button
            className="button-primary"
            onClick={() => openModal("reportSend")}
          >
            Enviar informes vía WhatsApp
          </button>
        </nav>

        <section className="section-page">
          <h2 className="sub-title-page">Informes enviados</h2>
          {reports.length > 0 ? (
            <ul className="list-page">
              {reports.map((report) => (
                <li key={report.id} className="item-page">
                  <span className="report-title">{report.title}</span>
                  <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString("es-ES")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-reports">No hay informes enviados aún</p>
          )}
        </section>
      </main>

      <Modal
        isOpen={isOpen("reportSend")}
        closeModal={() => closeModal("reportSend")}
      >
        <FormReportSend />
      </Modal>
    </>
  );
};

export default Report;

import {supabase} from "../supabaseClient.js";

const ViewPdfButton = ({ route }) => {
  const cleanCode = encodeURI(route)
  const handleViewPdf = async () => {
    const { data, error } = await supabase.storage
      .from("medical-reports")
      .createSignedUrl(cleanCode, 300);

    if (error) {
      console.error("Error fetching PDF URL:", error);
      return;
    }

    const pdfUrl = data.signedUrl;

    window.open(pdfUrl, "_blank");
  };

  return (
    <button onClick={handleViewPdf} className="button-management">
      Ver Detalles
    </button>
  );
};

export default ViewPdfButton;

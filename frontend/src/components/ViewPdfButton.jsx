import {supabase} from "../supabaseClient.js";

const ViewPdfButton = ({ route }) => {
  console.log("Route received in ViewPdfButton:", route);
   const cleanRoute = route.replace(/^medical-reports\//, "").trim();
   console.log("-----------------------------------")
  console.log("Cleaned route:", cleanRoute);
  const handleViewPdf = async () => {
    const { data, error } = await supabase.storage
      .from("medical-reports")
      .createSignedUrl(cleanRoute, 300);

    if (error) {
      console.error("Error fetching PDF URL:", error);
      return;
    }

    window.open(data?.signedUrl, "_blank");
  };

  return (
    <button onClick={handleViewPdf} className="button-management">
      Ver Detalles
    </button>
  );
};

export default ViewPdfButton;

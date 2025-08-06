import { serve } from "http_server";
import { createClient } from "supabase";

export const svc = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// 1. Define los encabezados CORS. El asterisco (*) permite cualquier origen.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 2. Maneja la petición "preflight" OPTIONS del navegador.
  // Esto es lo que el navegador envía primero para verificar los permisos CORS.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, username, first_name, last_name, role } = await req.json();

    const { data, error } = await svc.auth.admin.inviteUserByEmail(email, {
      data: { username, first_name, last_name, role },
    });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      // 3. Añade los encabezados CORS a la respuesta exitosa.
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      // 4. Añade los encabezados CORS también a la respuesta de error.
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

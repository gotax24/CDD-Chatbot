import { serve } from "http_server";
import { createClient } from "supabase";

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// Configuración de Supabase
const supabaseUrl =
  Deno.env.get("PROJECT_URL") ?? Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey =
  Deno.env.get("SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Obtener datos del request
    const { email, password, username, first_name, last_name, role } =
      await req.json();

    console.log("Creating user:", email);

    // Crear usuario
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, first_name, last_name, role },
      email_confirm: true,
    });

    if (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Usuario creado exitosamente",
        user: data.user,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

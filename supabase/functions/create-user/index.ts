import { serve } from "http_server";
import { createClient } from "supabase";
export const svc = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }
  try {
    const { email, password, username, first_name, last_name, role } = await req.json();
    const { data: user, error } = await svc.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        username,
        first_name,
        last_name,
        role
      }
    });
    if (error) throw error;
    return new Response(JSON.stringify({
      user
    }), {
      status: 200
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 400
    });
  }
});

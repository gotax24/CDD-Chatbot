import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const svc = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
serve(async (req: Request) => {
  try {
    const { user_id } = await req.json();
    // 1) Eliminar perfil vinculado
    const { error: profileError } = await svc
      .from("profiles")
      .delete()
      .eq("id", user_id);
    if (profileError) throw profileError;
    // 2) Eliminar usuario en auth
    const { error: authError } = await svc.auth.admin.deleteUser(user_id);
    if (authError) throw authError;
    return new Response(
      JSON.stringify({
        message: "User deleted",
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("Full error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || JSON.stringify(err),
      }),
      {
        status: 400,
      }
    );
  }
});

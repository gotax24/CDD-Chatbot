import { serve } from "http_server";
import { createClient } from "supabase";

export const svc = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { email, username, first_name, last_name, role } = await req.json();

    // Usamos 'inviteUserByEmail' en lugar de 'createUser'
    const { data, error } = await svc.auth.admin.inviteUserByEmail(email, {
      data: {
        // Pasamos todos los datos necesarios para el trigger
        username,
        first_name,
        last_name,
        role,
      },
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Invitación enviada correctamente" }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});

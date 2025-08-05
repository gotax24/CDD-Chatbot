import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const svc = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const { email, password, username, first_name, last_name, role } =
      await req.json();

    const { data: user, error } = await svc.auth.admin.createUser({
      email,
      password,
      user_metadata: { username, first_name, last_name, role },
    });

    if (error) throw error;
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
});

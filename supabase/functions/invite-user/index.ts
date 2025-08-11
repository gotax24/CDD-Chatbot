import { serve } from "http_server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const svc = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const { email, username, first_name, last_name, role } = await req.json();
    const { data: user, error: inviteError } =
      await svc.auth.admin.inviteUserByEmail(email);
    const { data: userList, error: listError } = await svc.auth.admin.listUsers(
      {
        email,
      }
    );
    if (listError) throw listError;
    const invitedUser = userList?.users?.[0];
    if (!invitedUser?.id)
      throw new Error("No se encontró el usuario invitado.");
    const { error: metaError } = await svc.auth.admin.updateUserById(
      invitedUser.id,
      {
        user_metadata: {
          username,
          first_name,
          last_name,
          role,
        },
      }
    );
    return new Response(
      JSON.stringify({
        message: "User invited successfully",
        user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

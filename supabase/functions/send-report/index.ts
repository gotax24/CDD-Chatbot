// supabase/functions/send-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { patientId, reportIds, senderId } = await req.json();

    if (!patientId || !reportIds?.length || !senderId) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Buscar paciente
    const { data: patient, error: patientError } = await supabase
      .from("patient")
      .select("id, name, lastName, numberPhone")
      .eq("id", patientId)
      .single();

    if (patientError) throw patientError;

    const { data: reports, error: reportsError } = await supabase
      .from("medical_reports")
      .select("route, title")
      .in("id", reportIds);

    if (reportsError) throw reportsError;

    if (!reports || reports.length !== reportIds.length) {
      console.warn("Algunos IDs de informes no fueron encontrados.");
    }

    // 3. Firmar URLs de informes (ahora el bucle es en memoria, no en BD)
    const signedUrls: string[] = [];
    for (const report of reports) {
      const { data: signed, error: signedError } = await supabase.storage
        .from("reports")
        .createSignedUrl(report.route, 60 * 5);

      if (signedError) throw signedError;
      signedUrls.push(signed.signedUrl);
    }

    // 3. Enviar por WhatsApp
    const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${Deno.env.get(
      "PHONE_NUMBER_ID"
    )}/messages`;
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    };

    // Plantilla
    const templatePayload = {
      messaging_product: "whatsapp",
      to: `58${patient.numberPhone}`,
      type: "template",
      template: {
        name: "envio_informe",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: `${patient.name} ${patient.lastName}` },
            ],
          },
        ],
      },
    };

    const templateResp = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(templatePayload),
    });
    const templateData = await templateResp.json();
    if (!templateResp.ok)
      throw new Error(`Template failed: ${JSON.stringify(templateData)}`);

    // Documentos
    const docsResults: any = [];
    for (const url of signedUrls) {
      const pdfPayload = {
        messaging_product: "whatsapp",
        to: `58${patient.numberPhone}`,
        type: "document",
        document: { link: url, filename: "Informe_Medico.pdf" },
      };
      const resp = await fetch(WHATSAPP_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(pdfPayload),
      });
      const result = await resp.json();
      docsResults.push(result);
      if (!resp.ok) throw new Error(`Doc failed: ${JSON.stringify(result)}`);
    }

    // 4. Registrar en deliveries
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        patientId: patient.id,
        senderId,
        status: "SENT",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    const { data: updateReports, error: updateReportsError } = await supabase
      .from("medical_reports")
      .update({ state: "sent", deliveryId: delivery.id })
      .in("id", reportIds)
      .select();

    if (deliveryError) throw deliveryError;

    if (updateReportsError) throw updateReportsError;

    return new Response(
      JSON.stringify({ templateData, docsResults, delivery, updateReports }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

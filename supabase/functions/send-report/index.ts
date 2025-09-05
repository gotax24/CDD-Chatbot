// supabase/functions/send-report/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { to, pdf_url, name } = await req.json();

    if (!to || !pdf_url) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'pdf_url'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${Deno.env.get(
      "PHONE_NUMBER_ID"
    )}/messages`;
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN");

    if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing WhatsApp credentials" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Paso 1: enviar plantilla (abre la ventana de conversación)
    const templatePayload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "envio_informe",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: name || "Paciente" }],
          },
        ],
      },
    };

    const templateResp = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(templatePayload),
    });

    const templateData = await templateResp.json();
    if (!templateResp.ok) {
      return new Response(JSON.stringify(templateData), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Paso 2: enviar el PDF
    const pdfPayload = {
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        link: pdf_url,
        filename: "Informe_Medico.pdf",
      },
    };

    const pdfResp = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(pdfPayload),
    });

    const pdfData = await pdfResp.json();

    return new Response(JSON.stringify({ templateData, pdfData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

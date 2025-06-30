
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  message: string;
  userEmail?: string;
  userAgent?: string;
  pageUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!adminEmail) {
      throw new Error("Admin email not configured");
    }

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("Resend API key not configured");
    }

    const { message, userEmail, userAgent, pageUrl }: FeedbackEmailRequest = await req.json();

    if (!message || message.trim().length === 0) {
      throw new Error("Feedback message is required");
    }

    const emailResponse = await resend.emails.send({
      from: "ProdStack Feedback <noreply@resend.dev>",
      to: [adminEmail],
      subject: "New Feedback from ProdStack User",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Feedback Received</h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Feedback Message:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message}</p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <h4 style="margin-top: 0; color: #374151;">Additional Information:</h4>
            ${userEmail ? `<p><strong>User Email:</strong> ${userEmail}</p>` : '<p><strong>User Email:</strong> Anonymous</p>'}
            ${pageUrl ? `<p><strong>Page URL:</strong> ${pageUrl}</p>` : ''}
            ${userAgent ? `<p><strong>User Agent:</strong> ${userAgent}</p>` : ''}
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This email was sent automatically from the ProdStack feedback system.</p>
          </div>
        </div>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Feedback email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const SESSION_SECRET = process.env.PAYMENT_SESSION_SECRET || "vemb_production_gated_secret_2026_xyz";
const ALL_IN_ONE_LINK = "https://drive.google.com/file/d/1sIJ5rWp0Gv-oSZGCnGwJ2N_EKtgUT0I2/view?usp=drive_link";

function createSecureToken(payload: any) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

async function sendEmail(name: string, email: string) {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.FROM_EMAIL || "noreply@editorsmega.com";
  const fromName = process.env.FROM_NAME || "EditorsMega Team";
  const appUrl = process.env.APP_URL || "https://editorsmega.com";

  if (!resendApiKey) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email.");
    return { delivered: false };
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body{font-family:Helvetica,Arial,sans-serif;background:#050505;color:#e4e4e7;margin:0;padding:0}
.wrap{max-width:600px;margin:40px auto;background:#0c0c0e;border:1px solid #27272a;border-radius:16px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#7c3aed,#d946ef,#f97316);padding:40px 20px;text-align:center}
.hdr h1{color:#fff;margin:0;font-size:28px;font-weight:800;text-transform:uppercase;letter-spacing:2px}
.body{padding:30px 40px}
.greeting{font-size:18px;font-weight:bold;color:#fff;margin-bottom:10px}
.msg{font-size:14px;color:#a1a1aa;line-height:1.6;margin-bottom:25px}
.cabinet{background:#050505;border:1px solid #1f1f23;border-radius:12px;padding:20px;margin-bottom:25px}
.cabinet h2{font-size:12px;font-family:monospace;color:#a78bfa;margin:0 0 15px;text-transform:uppercase;letter-spacing:1px}
.btn-green{display:block;background:#10b981;color:#000;font-weight:bold;text-align:center;text-decoration:none;padding:14px;border-radius:8px;margin-bottom:10px;font-size:14px}
.btn-dark{display:block;background:#0c0c0e;border:1px solid #27272a;color:#fff;text-align:center;text-decoration:none;padding:12px;border-radius:8px;font-size:13px;margin-bottom:10px}
.row{display:flex;justify-content:space-between;align-items:center;background:#0c0c0e;border:1px solid #18181b;border-radius:8px;padding:10px 14px;margin-bottom:6px}
.rname{color:#e4e4e7;font-size:13px;font-weight:600}
.rsize{color:#71717a;font-size:11px;font-family:monospace}
.lic{text-align:center;margin:20px 0}
.lic-label{font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px}
.lic-code{display:inline-block;background:#18181b;color:#e4e4e7;font-family:monospace;font-size:13px;padding:6px 14px;border-radius:6px;margin-top:8px;font-weight:bold;letter-spacing:2px}
.footer{border-top:1px solid #18181b;padding-top:20px;text-align:center;font-size:11px;color:#52525b;line-height:1.6;margin-top:20px}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><h1>EDITORS<span style="color:#fbbf24">MEGA</span></h1></div>
  <div class="body">
    <div class="greeting">Congratulations ${name}! Key Unlocked. 🎉</div>
    <div class="msg">
      Your purchase of the <strong>Video Editing Mega Bundle</strong> ($9.00 lifetime access) has been approved.<br/><br/>
      Your assets and download links are ready in your dedicated Google Drive directories.
    </div>
    <div class="cabinet">
      <h2>⚡ Secure Digital Delivery Cabinet</h2>
      <a class="btn-green" href="${ALL_IN_ONE_LINK}" target="_blank">⚡ DOWNLOAD ALL-IN-ONE EDITING PACK (56 GB)</a>
      <a class="btn-dark" href="${appUrl}/vault?code=VEMB-2026-X779A" target="_blank">📁 EXPLORE INDIVIDUAL CABINETS & MODULES</a>
    </div>
    <div class="cabinet">
      <h2>📦 What's Inside Your Bundle</h2>
      <div class="row"><span class="rname">🎬 Presets & LUTs Pack</span><span class="rsize">2.4 GB</span></div>
      <div class="row"><span class="rname">🎵 Hollywood SFX Library</span><span class="rsize">1.8 GB</span></div>
      <div class="row"><span class="rname">✨ MOGRT Titles & SVG Instants</span><span class="rsize">940 MB</span></div>
      <div class="row"><span class="rname">📖 Installation Tutorial Manuals</span><span class="rsize">18 MB</span></div>
    </div>
    <div class="lic">
      <div class="lic-label">Your License / Registration Code</div>
      <span class="lic-code">VEMB-2026-X779A</span>
    </div>
    <div class="footer">
      Questions? Contact us at <a href="mailto:support@editorsmega.com" style="color:#a78bfa">support@editorsmega.com</a><br/><br/>
      © 2026 EditorsMega Inc. Fully royalty-free and commercial use licensed.
    </div>
  </div>
</div>
</body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: `🚀 Your Video Editing Mega Bundle is Ready, ${name}!`,
        html,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("[Resend Error]", result);
      return { delivered: false, error: result.message };
    }
    console.log(`[Email] Sent to ${email}, ID: ${result.id}`);
    return { delivered: true, messageId: result.id };
  } catch (err: any) {
    console.error("[Email Error]", err);
    return { delivered: false, error: err.message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, paymentMethod } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Missing name or email address." });
    }

    console.log(`[Checkout] Processing for ${name} (${email}) via ${paymentMethod}`);
    const secureToken = createSecureToken({ name, email, paid: true, method: paymentMethod || "card", timestamp: Date.now() });
    const emailResult = await sendEmail(name, email);

    return res.status(200).json({
      status: "success",
      token: secureToken,
      delivered: emailResult.delivered,
      messageId: (emailResult as any).messageId,
      message: emailResult.delivered ? "Download link sent to your email!" : "Order authorized.",
    });
  } catch (error: any) {
    console.error("[Checkout Error]", error);
    return res.status(500).json({ error: "Internal server error.", details: error.message });
  }
}

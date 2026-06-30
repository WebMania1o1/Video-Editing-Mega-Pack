import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { DELIVERY_CONFIG } from "../src/config/delivery-config";

dotenv.config({ override: true });

export const SESSION_SECRET = process.env.PAYMENT_SESSION_SECRET || "vemb_production_gated_secret_2026_xyz";

export function createSecureToken(payload: any) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifySecureToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return decodedBody;
  } catch (e) {
    return null;
  }
}

export function getRazorpayKeys() {
  const rawKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_T1rCMA6x5t6hrI";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "Wae6hMi4q3dxaYEGFlo4LiiZ";
  
  const keyId = rawKeyId.trim().replace(/^["']|["']$/g, "");
  const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, "");
  
  return { keyId, keySecret };
}

export function getRazorpayInstance() {
  const { keyId, keySecret } = getRazorpayKeys();
  const RazorpayConstructor = (Razorpay as any).default || Razorpay;
  return new RazorpayConstructor({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function fulfillOrder(name: string, email: string, paymentMethod: string) {
  const tokenPayload = {
    name,
    email,
    paid: true,
    method: paymentMethod || "card",
    timestamp: Date.now()
  };
  const secureToken = createSecureToken(tokenPayload);

  const smtpHost = process.env.SMTP_HOST || DELIVERY_CONFIG.SMTP.DEFAULT_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || String(DELIVERY_CONFIG.SMTP.DEFAULT_PORT), 10);
  const smtpUser = process.env.SMTP_USER || DELIVERY_CONFIG.SMTP.DEFAULT_SENDER_USER;
  const smtpPass = process.env.SMTP_PASS || DELIVERY_CONFIG.SMTP.DEFAULT_SENDER_PASS;
  const fromName = process.env.FROM_NAME || DELIVERY_CONFIG.SMTP.DEFAULT_FROM_NAME;

  const emailSubject = (DELIVERY_CONFIG.SMTP.EMAIL_SUBJECT || `🚀 Your Video Editing Mega Bundle is Ready, {name}!`).replace("{name}", name);

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Authorized! EditorsMega</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #050505;
        color: #e4e4e7;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #0c0c0e;
        border: 1px solid #27272a;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      .header {
        background-image: linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%);
        padding: 40px 20px;
        text-align: center;
      }
      .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .content {
        padding: 30px 40px;
      }
      .greeting {
        font-size: 18px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10px;
      }
      .message {
        font-size: 14px;
        color: #a1a1aa;
        line-height: 1.6;
        margin-bottom: 25px;
      }
      .download-cabinet {
        background-color: #050505;
        border: 1px solid #1f1f23;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
      }
      .download-cabinet h2 {
        font-size: 13px;
        font-family: monospace;
        color: #a78bfa;
        margin-top: 0;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .download-row {
        display: block;
        background-color: #0c0c0e;
        border: 1px solid #18181b;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        text-decoration: none;
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .download-row:hover {
        border-color: #7c3aed;
        background-color: #101014;
      }
      .support-footer {
        border-top: 1px solid #18181b;
        padding-top: 20px;
        text-align: center;
        font-size: 11px;
        color: #52525b;
        line-height: 1.5;
        margin-top: 25px;
      }
      .license-code {
        display: inline-block;
        background-color: #18181b;
        color: #e4e4e7;
        font-family: monospace;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 4px;
        margin-top: 15px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>EDITORS<span style="color: #ffffff;">MEGA</span></h1>
      </div>
      <div class="content">
        <div class="greeting">Congratulations ${name}! Key Unlocked.</div>
        <div class="message">
          Your purchase of the <strong>Video Editing Mega Bundle</strong> ($9.00 lifetime access) has been approved and authorized. 
          <br/><br/>
          Your assets and download links are prepared inside your dedicated Google Drive master directories. Click the directory links below to start importing immediate resources into Premiere Pro, After Effects, DaVinci Resolve, or Final Cut.
        </div>
        
        <div class="download-cabinet">
          <h2>Secure Digital Delivery Cabinet</h2>
          
          <a class="download-row" href="${DELIVERY_CONFIG.ALL_IN_ONE_DOWNLOAD_LINK}" target="_blank" style="background-color: #10b981; border: 1px solid #10b981; color: #000000; font-weight: bold; text-align: center; text-decoration: none; display: block; padding: 14px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;">
            ⚡ DOWNLOAD ALL-IN-ONE EDITING PACK (56 GB)
          </a>
          
          <a class="download-row" href="${process.env.APP_URL || 'http://localhost:3000'}/vault?code=VEMB-2026-X779A" target="_blank" style="text-align: center; display: block;">
            📁 EXPLORE INDIVIDUAL CABINETS & MODULES
          </a>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">YOUR REGISTERED REGISTRATION / LICENSE CODE</div>
          <span class="license-code">VEMB-2026-X779A</span>
        </div>

        <div class="support-footer">
          If you have any questions or require customization support for your rendering nodes, write our response desk at support@editorsmega.com.
          <br/><br/>
          © 2026 EditorsMega Inc. Fully royalty-free and commercial use licensed.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // Check if SMTP is configured
  if (!smtpUser || !smtpPass) {
    console.warn("[Checkout SMTP] Warning: SMTP email configurations (SMTP_USER / SMTP_PASS) are not populated in environment secrets.");
    return {
      secureToken,
      delivered: false,
      warning: "SMTP Credentials not configured. Using fallback sandbox fulfillment.",
      message: `Your sandbox order was successfully authorized! To send actual emails, please configure SMTP_USER and SMTP_PASS.`,
      details: { name, email, paymentMethod }
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`[Checkout API] Email successfully delivered to ${email}. MessageId: ${info.messageId}`);
    return {
      secureToken,
      delivered: true,
      messageId: info.messageId,
      message: "A secure download link has been sent directly to your registered email address!"
    };
  } catch (error: any) {
    console.error("[Checkout SMTP Error]", error);
    return {
      secureToken,
      delivered: false,
      error: error.message,
      message: "Payment success, but email delivery encountered a terminal SMTP failure. Access has been generated."
    };
  }
}

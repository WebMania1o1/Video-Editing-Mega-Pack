import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

async function fulfillOrder(name: string, email: string, paymentMethod: string) {
  const secureToken = createSecureToken({
    name, email, paid: true,
    method: paymentMethod || "card",
    timestamp: Date.now(),
  });

  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";

  if (!smtpUser || !smtpPass) {
    console.warn("[Checkout] SMTP not configured, skipping email.");
    return { secureToken, delivered: false, message: "Order authorized. Configure SMTP to send emails." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const appUrl = process.env.APP_URL || "https://editorsmega.vercel.app";
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "EditorsMega"}" <${smtpUser}>`,
      to: email,
      subject: `Your Video Editing Mega Bundle is Ready, ${name}!`,
      html: `<h2>Hi ${name}, your purchase is confirmed!</h2>
             <p><a href="${ALL_IN_ONE_LINK}">Download All-in-One Pack (56GB)</a></p>
             <p><a href="${appUrl}/vault?code=VEMB-2026-X779A">Access Your Vault</a></p>
             <p>License: <strong>VEMB-2026-X779A</strong></p>`,
    });
    console.log(`[Checkout] Email sent to ${email}: ${info.messageId}`);
    return { secureToken, delivered: true, messageId: info.messageId, message: "Download link sent to your email!" };
  } catch (error: any) {
    console.error("[Checkout SMTP Error]", error);
    return { secureToken, delivered: false, error: error.message, message: "Payment success. Email delivery failed." };
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
    const result = await fulfillOrder(name, email, paymentMethod || "card");

    return res.status(200).json({
      status: "success",
      token: result.secureToken,
      delivered: result.delivered,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[Checkout Error]", error);
    return res.status(500).json({
      error: "Internal server error during checkout.",
      details: error.message,
    });
  }
}

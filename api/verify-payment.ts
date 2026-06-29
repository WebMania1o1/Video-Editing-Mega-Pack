import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import nodemailer from "nodemailer";

const SESSION_SECRET = process.env.PAYMENT_SESSION_SECRET || "vemb_production_gated_secret_2026_xyz";
const ALL_IN_ONE_LINK = "https://drive.google.com/file/d/1sIJ5rWp0Gv-oSZGCnGwJ2N_EKtgUT0I2/view?usp=drive_link";

function getRazorpayKeys() {
  const rawKeyId = process.env.RAZORPAY_KEY_ID || "";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const keyId = rawKeyId.trim().replace(/^["']|["']$/g, "");
  const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, "");
  return { keyId, keySecret };
}

function createSecureToken(payload: any) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifySecureToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch (e) {
    return null;
  }
}

async function fulfillOrder(name: string, email: string, paymentMethod: string) {
  const secureToken = createSecureToken({
    name, email, paid: true,
    method: paymentMethod || "razorpay",
    timestamp: Date.now(),
  });

  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";

  if (!smtpUser || !smtpPass) {
    console.warn("[Fulfill] SMTP not configured, skipping email.");
    return { secureToken, delivered: false };
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
    console.log(`[Fulfill] Email sent to ${email}: ${info.messageId}`);
    return { secureToken, delivered: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Fulfill SMTP Error]", error);
    return { secureToken, delivered: false, error: error.message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, razorpay_payment_id, razorpay_order_id, razorpay_signature, name, email } = req.body;

  if (token) {
    const payload = verifySecureToken(token);
    if (payload && payload.paid) {
      return res.status(200).json({ success: true, name: payload.name, email: payload.email, timestamp: payload.timestamp });
    }
    return res.status(401).json({ success: false, error: "Invalid token." });
  }

  if (razorpay_payment_id || razorpay_order_id || razorpay_signature) {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing Razorpay signature parameters." });
    }
    if (!email || !name) {
      return res.status(400).json({ success: false, error: "Missing name or email." });
    }

    const { keySecret } = getRazorpayKeys();
    if (!keySecret) {
      return res.status(500).json({ success: false, error: "Server credentials missing." });
    }

    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn(`[Verify] Signature mismatch.`);
      return res.status(400).json({ success: false, error: "Signature mismatch." });
    }

    console.info(`[Verify] Signature verified for order: ${razorpay_order_id}`);
    const fulfillment = await fulfillOrder(name, email, "razorpay");

    return res.status(200).json({
      success: true,
      token: fulfillment.secureToken,
      delivered: fulfillment.delivered,
      message: "Payment verified. Access granted!",
    });
  }

  return res.status(400).json({ success: false, error: "Missing verification parameters." });
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getRazorpayInstance, getRazorpayKeys } from "./utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount, currency, receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Missing purchase amount paise denomination." });
    }

    const paiseAmount = Number(amount);
    if (isNaN(paiseAmount) || paiseAmount < 100) {
      return res.status(400).json({ error: "Amount must be a valid number of at least 100 paise." });
    }

    const { keyId, keySecret } = getRazorpayKeys();

    console.log(`[Create Order Backend] Sanitized Razorpay Key ID: "${keyId.substring(0, 12)}..." (Length: ${keyId.length}), Secret Length: ${keySecret.length}`);

    if (!keyId || !keySecret) {
      console.error("[Create Order API] Razorpay key/secret environment configurations are unassigned.");
      return res.status(500).json({ error: "Razorpay provider credentials are not assigned on host environments." });
    }

    console.log(`[Create Order Backend] Initializing Razorpay wrapper`);
    const razorpay = getRazorpayInstance();

    const orderOptions = {
      amount: paiseAmount,
      currency: currency || "INR",
      receipt: receipt || `rec_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    };

    console.log("[Create Order Backend] Creating Razorpay backend order entity draft:", orderOptions);
    const order = await razorpay.orders.create(orderOptions);

    console.log(`[Create Order Backend] Order registration succeeded. Reference Token: ${order.id}`);
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("[Create Order Exception Hook] Detailed error:", err);
    let errorDetail = err?.message || String(err);
    if (err?.error && typeof err.error === "object") {
      errorDetail = err.error.description || err.error.message || JSON.stringify(err.error);
    } else if (err?.description) {
      errorDetail = err.description;
    }
    return res.status(500).json({
      error: "Failed to create dynamic backend Razorpay order sequence.",
      details: errorDetail
    });
  }
}

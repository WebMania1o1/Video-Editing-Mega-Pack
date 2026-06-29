import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import Razorpay from "razorpay";

function getRazorpayKeys() {
  const rawKeyId = process.env.RAZORPAY_KEY_ID || "";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const keyId = rawKeyId.trim().replace(/^["']|["']$/g, "");
  const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, "");
  return { keyId, keySecret };
}

function getRazorpayInstance() {
  const { keyId, keySecret } = getRazorpayKeys();
  const RazorpayConstructor = (Razorpay as any).default || Razorpay;
  return new RazorpayConstructor({ key_id: keyId, key_secret: keySecret });
}

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
    console.log(`[Create Order] Key ID: "${keyId.substring(0, 12)}..." Length: ${keyId.length}, Secret Length: ${keySecret.length}`);

    if (!keyId || !keySecret) {
      console.error("[Create Order] Razorpay keys not configured.");
      return res.status(500).json({ error: "Razorpay credentials not configured." });
    }

    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: paiseAmount,
      currency: currency || "INR",
      receipt: receipt || `rec_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    };

    console.log("[Create Order] Creating order:", orderOptions);
    const order = await razorpay.orders.create(orderOptions);
    console.log(`[Create Order] Success. Order ID: ${order.id}`);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("[Create Order Error]", err);
    let errorDetail = err?.message || String(err);
    if (err?.error && typeof err.error === "object") {
      errorDetail = err.error.description || err.error.message || JSON.stringify(err.error);
    } else if (err?.description) {
      errorDetail = err.description;
    }
    return res.status(500).json({
      error: "Failed to create Razorpay order.",
      details: errorDetail,
    });
  }
}

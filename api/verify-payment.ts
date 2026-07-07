import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { fulfillOrder, verifySecureToken, getRazorpayKeys } from "./utils";

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

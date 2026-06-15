import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { verifySecureToken, getRazorpayKeys, fulfillOrder } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, razorpay_payment_id, razorpay_order_id, razorpay_signature, name, email } = req.body;
  
  // Existing token verification flow
  if (token) {
    const payload = verifySecureToken(token);
    if (payload && payload.paid) {
      return res.status(200).json({
        success: true,
        name: payload.name,
        email: payload.email,
        timestamp: payload.timestamp
      });
    }
    return res.status(401).json({ success: false, error: "Invalid payment credentials token." });
  }

  // Razorpay standard signature verification flow
  if (razorpay_payment_id || razorpay_order_id || razorpay_signature) {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing required Razorpay payment signature parameters." });
    }

    if (!email || !name) {
      return res.status(400).json({ success: false, error: "Missing customer name or email details for fulfillment." });
    }

    const { keySecret } = getRazorpayKeys();
    if (!keySecret) {
      console.error("[Verify API] RAZORPAY_KEY_SECRET is not configured on server.");
      return res.status(500).json({ success: false, error: "Server credentials configuration missing." });
    }

    // Generate HMAC-SHA256 signature according to standard integration step
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn(`[Verify API] Razorpay payment signature mismatch. Generated: ${generated_signature}, Received: ${razorpay_signature}`);
      return res.status(400).json({ success: false, error: "Razorpay secure payment verification signature mismatch." });
    }

    console.info(`[Verify API] Razorpay payment signature verified successfully for order: ${razorpay_order_id}`);

    // Perform unified order fulfillment (token generation + email shipment)
    const fulfillment = await fulfillOrder(name, email, "razorpay");

    return res.status(200).json({
      success: true,
      token: fulfillment.secureToken,
      delivered: fulfillment.delivered,
      message: "Payment signature verified. Access credentials configured and dispatched!"
    });
  }

  return res.status(400).json({ success: false, error: "Missing required verification parameters." });
}

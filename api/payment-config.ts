import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";

dotenv.config({ override: true });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const rzpKeys = Object.keys(process.env).filter(k => k.includes("RAZORPAY"));
  const paypalKeys = Object.keys(process.env).filter(k => k.includes("PAYPAL"));
  console.log("[Payment Config Debug] Found Razorpay env keys:", rzpKeys);
  console.log("[Payment Config Debug] Found Paypal env keys:", paypalKeys);
  
  // Resolve all possible key names for Razorpay
  const rzpKeyId = process.env.VITE_RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY || 
                   process.env.RAZORPAY_API_KEY || 
                   process.env.VITE_RAZORPAY_KEY ||
                   "rzp_test_T1rCMA6x5t6hrI";
                   
  const paypalId = process.env.VITE_PAYPAL_CLIENT_ID || 
                   process.env.PAYPAL_CLIENT_ID || 
                   process.env.PAYPAL_KEY || 
                   "sb";

  const rzpCurrency = process.env.VITE_RAZORPAY_CURRENCY || 
                      process.env.RAZORPAY_CURRENCY || 
                      "INR";

  console.info("[Payment Config Debug] Selected Razorpay Key ID:", rzpKeyId);

  return res.status(200).json({
    paypalClientId: paypalId,
    razorpayKeyId: rzpKeyId,
    razorpayCurrency: rzpCurrency
  });
}

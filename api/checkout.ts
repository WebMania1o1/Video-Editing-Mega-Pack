import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fulfillOrder } from "./utils";

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
      messageId: (result as any).messageId,
      warning: (result as any).warning,
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

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fulfillOrder } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, paymentMethod } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Missing name or email address" });
    }

    console.log(`[Checkout API] Processing order for ${name} (${email}) using ${paymentMethod}`);
    const fulfillmentResult = await fulfillOrder(name, email, paymentMethod || "card");
    
    return res.status(200).json({
      status: "success",
      token: fulfillmentResult.secureToken,
      delivered: fulfillmentResult.delivered,
      messageId: (fulfillmentResult as any).messageId,
      warning: (fulfillmentResult as any).warning,
      message: fulfillmentResult.message
    });

  } catch (error: any) {
    console.error("[Checkout API Error]", error);
    return res.status(500).json({
      error: "Internal server error occurred processing order fulfillment.",
      details: error.message
    });
  }
}

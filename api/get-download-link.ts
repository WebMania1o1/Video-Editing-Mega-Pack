import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifySecureToken } from "./_utils";
import { DELIVERY_CONFIG } from "../src/config/delivery-config";

const PREMIUM_DOWNLOADS = DELIVERY_CONFIG.PREMIUM_DOWNLOADS_DATABASE;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, assetId } = req.body;
  if (!token || !assetId) {
    return res.status(401).json({ error: "Unauthorized download parameters." });
  }
  
  const payload = verifySecureToken(token);
  if (!payload || !payload.paid) {
    return res.status(401).json({ error: "Unauthenticated payment signature." });
  }
  
  const url = PREMIUM_DOWNLOADS[assetId];
  if (!url) {
    return res.status(404).json({ error: "Archive module not found on secure storage hosts." });
  }
  
  return res.status(200).json({ success: true, url });
}

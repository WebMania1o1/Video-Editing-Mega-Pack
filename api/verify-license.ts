import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSecureToken } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, licenseKey } = req.body;
  if (!email || !licenseKey) {
    return res.status(400).json({ error: "Email and License key are required." });
  }
  
  const cleanKey = String(licenseKey).trim().toUpperCase();
  if (cleanKey === "VEMB-2026-X779A" || cleanKey === "VEMB-2026-X779A-VIP95") {
    const name = email.split("@")[0] || "Creative Editor";
    const token = createSecureToken({ name, email, paid: true, timestamp: Date.now() });
    return res.status(200).json({
      success: true,
      token,
      name,
      email
    });
  } else {
    return res.status(401).json({ error: "Invalid license verification signature." });
  }
}

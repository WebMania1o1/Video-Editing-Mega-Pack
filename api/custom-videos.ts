import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const mapPath = path.join(process.cwd(), "public", "uploads", "map.json");
    if (fs.existsSync(mapPath)) {
      const content = fs.readFileSync(mapPath, "utf-8");
      return res.status(200).json(JSON.parse(content));
    }
    return res.status(200).json({});
  } catch (err: any) {
    console.error("[Custom Videos Map Fetch Error]", err);
    return res.status(200).json({});
  }
}

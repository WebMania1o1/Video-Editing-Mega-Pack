import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { assetId, filename, fileData } = req.body;

    if (!assetId || !filename || !fileData) {
      return res.status(400).json({ error: "Missing assetId, filename, or fileData contents." });
    }

    // Hardened parameters sanitization to prevent injection / path traversals
    const sanitizedAssetId = String(assetId).replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitizedFilename = String(filename).replace(/[^a-zA-Z0-9.-]/g, "_");

    console.log(`[Upload API] Storing persistent custom video preview for asset: ${sanitizedAssetId} - File: ${sanitizedFilename}`);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Convert base64 data to binary buffer
    const base64Data = fileData.replace(/^data:video\/[^;]+;base64,/, "").replace(/^data:image\/[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileDestination = path.join(uploadsDir, `${sanitizedAssetId}-${sanitizedFilename}`);
    fs.writeFileSync(fileDestination, buffer);

    // Now update the mapping file
    const mapPath = path.join(uploadsDir, "map.json");
    let currentMap: Record<string, string> = {};
    if (fs.existsSync(mapPath)) {
      try {
        const contents = fs.readFileSync(mapPath, "utf-8");
        currentMap = JSON.parse(contents);
      } catch (err) {
        console.error("Failed to parse map.json", err);
      }
    }

    const relativeUrl = `/uploads/${sanitizedAssetId}-${sanitizedFilename}`;
    currentMap[sanitizedAssetId] = relativeUrl;

    fs.writeFileSync(mapPath, JSON.stringify(currentMap, null, 2), "utf-8");

    console.log(`[Upload API] Successfully stored to ${fileDestination}. Association: ${relativeUrl}`);

    return res.status(200).json({
      success: true,
      url: relativeUrl
    });
  } catch (err: any) {
    console.error("[Upload API Error]", err);
    return res.status(500).json({
      error: "Internal server error during video persistent saving sequence.",
      details: err.message
    });
  }
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";

dotenv.config();

// Private mapper of premium assets - not exposed to browser bundle!
const PREMIUM_DOWNLOADS: Record<string, string> = {
  "master-bundle": "https://drive.google.com/file/d/1sIJ5rWp0Gv-oSZGCnGwJ2N_EKtgUT0I2/view?usp=drive_link",
  "high-definition-3d": "https://drive.google.com/drive/folders/1ZZ7F2K15h-xa2HvZsyjMrssbFuQ5ApoX?usp=drive_link",
  "motion-graphic-fx-pack": "https://drive.google.com/drive/folders/1i6ZkumLWPGYZT4xOJ3x2b9jwo6mlK6PI",
  "mavic-luts": "https://drive.google.com/drive/folders/16o2za632lIzOetXMJlYGg2yv7wKMcfvF",
  "free-sound-fx": "https://drive.google.com/drive/folders/1pJfy2AhAxdBNBuFuPcat3SkvOXqwjnHX",
  "paper-rip-fx": "https://drive.google.com/drive/folders/1i_hpdKzfqfzED0wiEygh-mlff76Uyq4x?usp=drive_link",
  "smoke-fx": "https://drive.google.com/drive/folders/1Cqy-hZrzcWQOMqBb9S1j0rlMQdrlR7JD",
  "title-card-fx": "https://drive.google.com/drive/folders/1CJ577VzDuntaGD10RDtgE9ISHAs4JI7O",
  "free-2dfx": "https://drive.google.com/drive/folders/1XrJF8uFz3ig71fjsygdgwLr8jOMo2nWj?usp=drive_link",
  "holiday-fx": "https://drive.google.com/drive/folders/1NRxFNarAmC6ayoZCbblo7sMK8vh9Nofv",
  "scribble-fx": "https://drive.google.com/drive/folders/1FzOAN5OgqmtwdMRROLTvU2H3RcCaNZ_H?usp=drive_link",
  "ae-plugins": "https://drive.google.com/drive/folders/11NFGXFS8yE1DmaP1TtmVQWkWaGUdAc1j?usp=drive_link",
  "background-music": "https://drive.google.com/drive/folders/1o3vTcQXIHZk3cbz9eWJtObUG4te8-25G",
  "background-video-animation": "https://drive.google.com/drive/folders/1JIL9n3Q8r2fCK_jISQH9RkSV4sDxaQVH",
  "dust-snow-overlay": "https://drive.google.com/drive/folders/1IgW4RP5XoEiE46HYsxVKywvXF3z6X2Y9",
  "premiere-pro-transition": "https://drive.google.com/drive/folders/1_waNts06ntc4FK5mTxai6gk_sA2zOE_O",
  "premiere-pro-effects-preset": "https://drive.google.com/drive/folders/1vf5yaHwT1uKWzn8EWpFopuS4PlYRJmTj",
  "fire-sparks-sfx": "https://drive.google.com/drive/folders/1fA_bY94bv920sZS8MTyYTR63PuaYPQOg",
  "seamless-motion-transitions": "https://drive.google.com/drive/folders/1_1uibCxaHjzoCM3-9IARY5k4CuOs3XRx?usp=drive_link",
  "chroma-key-green-screen": "https://drive.google.com/drive/folders/13RgZrrTUrq_UyMhft-l60Aow65KXhNNd?usp=drive_link",
  "cyberpunk-grid-overlays": "https://drive.google.com/drive/folders/1njKTkkYmDvF3YN2dk4KMmXlgFaUkJp8J?usp=drive_link",
  "cabinet-1": "https://drive.google.com/drive/folders/16o2za632lIzOetXMJlYGg2yv7wKMcfvF",
  "cabinet-2": "https://drive.google.com/drive/folders/1pJfy2AhAxdBNBuFuPcat3SkvOXqwjnHX",
  "cabinet-3": "https://drive.google.com/drive/folders/1CJ577VzDuntaGD10RDtgE9ISHAs4JI7O",
  "cabinet-4": "https://drive.google.com/drive/folders/1njKTkkYmDvF3YN2dk4KMmXlgFaUkJp8J"
};

const SESSION_SECRET = process.env.PAYMENT_SESSION_SECRET || "vemb_production_gated_secret_2026_xyz";

function createSecureToken(payload: any) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifySecureToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return decodedBody;
  } catch (e) {
    return null;
  }
}

const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};
function rateLimiter(windowMs: number, max: number, message: string = "Too many requests, please try again later.") {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global_ip";
    const ipKey = String(ip);
    const now = Date.now();
    
    if (!rateLimitStore[ipKey] || now > rateLimitStore[ipKey].resetTime) {
      rateLimitStore[ipKey] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }
    
    rateLimitStore[ipKey].count++;
    if (rateLimitStore[ipKey].count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set secure HTTP headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' ws: wss:; frame-src 'self' https://*.paypal.com https://*.paypalobjects.com https://*.razorpay.com https://*.cardinalcommerce.com; connect-src 'self' https: ws: wss: https://*.paypal.com https://*.razorpay.com https://api.razorpay.com;"
    );
    next();
  });

  // Scale body-parser JSON dimensions to host high-res asset uploads safely
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Expose the uploaded storage directory statically for both dev and prod environments
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // API Route to fetch dynamic runtime payment configuration keys safely
  app.get("/api/payment-config", (req, res) => {
    const rzpKeys = Object.keys(process.env).filter(k => k.includes("RAZORPAY"));
    const paypalKeys = Object.keys(process.env).filter(k => k.includes("PAYPAL"));
    console.log("[Payment Config Debug] Found Razorpay env keys:", rzpKeys);
    console.log("[Payment Config Debug] Found Paypal env keys:", paypalKeys);
    rzpKeys.forEach(k => {
      console.log(`[Payment Config Debug] ${k} value is:`, process.env[k]);
    });
    
    // Resolve all possible key names for Razorpay
    const rzpKeyId = process.env.VITE_RAZORPAY_KEY_ID || 
                     process.env.RAZORPAY_KEY_ID || 
                     process.env.RAZORPAY_KEY || 
                     process.env.RAZORPAY_API_KEY || 
                     process.env.VITE_RAZORPAY_KEY ||
                     "rzp_test_zSgJb2pAbA9G8H";
                     
    const paypalId = process.env.VITE_PAYPAL_CLIENT_ID || 
                     process.env.PAYPAL_CLIENT_ID || 
                     process.env.PAYPAL_KEY || 
                     "sb";

    const rzpCurrency = process.env.VITE_RAZORPAY_CURRENCY || 
                        process.env.RAZORPAY_CURRENCY || 
                        "INR";

    console.info("[Payment Config Debug] Selected Razorpay Key ID:", rzpKeyId);

    res.json({
      paypalClientId: paypalId,
      razorpayKeyId: rzpKeyId,
      razorpayCurrency: rzpCurrency
    });
  });

  // API Route to fetch custom uploaded videos mapping
  app.get("/api/custom-videos", rateLimiter(60 * 1000, 60), (req, res) => {
    try {
      const mapPath = path.join(process.cwd(), "public", "uploads", "map.json");
      if (fs.existsSync(mapPath)) {
        const content = fs.readFileSync(mapPath, "utf-8");
        return res.json(JSON.parse(content));
      }
      return res.json({});
    } catch (err: any) {
      console.error("[Custom Videos Map Fetch Error]", err);
      return res.json({});
    }
  });

  // API Route to upload a persistent video file
  app.post("/api/upload-video", rateLimiter(5 * 60 * 1000, 10), async (req, res) => {
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

      console.log(`[Upload API] Successfully persistently stored to ${fileDestination}. Association: ${relativeUrl}`);

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
  });

  // API Route for confirming order and sending Nodemailer email
  app.post("/api/checkout", rateLimiter(60 * 1000, 15), async (req, res) => {
    try {
      const { name, email, paymentMethod } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Missing name or email address" });
      }

      console.log(`[Checkout API] Processing order for ${name} (${email}) using ${paymentMethod}`);

      // Create cryptographically secure token for payment confirmation
      const tokenPayload = {
        name,
        email,
        paid: true,
        method: paymentMethod || "card",
        timestamp: Date.now()
      };
      const secureToken = createSecureToken(tokenPayload);

      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";
      const fromName = process.env.FROM_NAME || "EditorsMega Team";

      const emailSubject = `🚀 Your Video Editing Mega Bundle is Ready, ${name}!`;

      // Master design of the email template
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Authorized! EditorsMega</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #050505;
            color: #e4e4e7;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0c0c0e;
            border: 1px solid #27272a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .header {
            background-image: linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .content {
            padding: 30px 40px;
          }
          .greeting {
            font-size: 18px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 10px;
          }
          .message {
            font-size: 14px;
            color: #a1a1aa;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .download-cabinet {
            background-color: #050505;
            border: 1px solid #1f1f23;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .download-cabinet h2 {
            font-size: 13px;
            font-family: monospace;
            color: #a78bfa;
            margin-top: 0;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .download-row {
            display: block;
            background-color: #0c0c0e;
            border: 1px solid #18181b;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 10px;
            text-decoration: none;
            color: #ffffff;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .download-row:hover {
            border-color: #7c3aed;
            background-color: #101014;
          }
          .download-badge {
            float: right;
            background-color: #27272a;
            color: #e4e4e7;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-weight: bold;
          }
          .support-footer {
            border-top: 1px solid #18181b;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #52525b;
            line-height: 1.5;
            margin-top: 25px;
          }
          .license-code {
            display: inline-block;
            background-color: #18181b;
            color: #e4e4e7;
            font-family: monospace;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 4px;
            margin-top: 15px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>EDITORS<span style="color: #ffffff;">MEGA</span></h1>
          </div>
          <div class="content">
            <div class="greeting">Congratulations ${name}! Key Unlocked.</div>
            <div class="message">
              Your purchase of the <strong>Video Editing Mega Bundle</strong> ($9.00 lifetime access) has been approved and authorized. 
              <br/><br/>
              Your assets and download links are prepared inside your dedicated Google Drive master directories. Click the directory links below to start importing immediate resources into Premiere Pro, After Effects, DaVinci Resolve, or Final Cut.
            </div>
            
            <div class="download-cabinet">
              <h2>Secure Digital Delivery Cabinet</h2>
              
              <a class="download-row" href="${process.env.APP_URL || 'http://localhost:3000'}/vault?code=VEMB-2026-X779A" target="_blank">
                📁 DOWNLOAD CABINET PORTAL ACCESS
              </a>
            </div>

            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px;">YOUR REGISTERED REGISTRATION / LICENSE CODE</div>
              <span class="license-code">VEMB-2026-X779A</span>
            </div>

            <div class="support-footer">
              If you have any questions or require customization support for your rendering nodes, write our response desk at support@editorsmega.com.
              <br/><br/>
              © 2026 EditorsMega Inc. Fully royalty-free and commercial use licensed.
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      // Check if SMTP is configured
      if (!smtpUser || !smtpPass) {
        console.warn("[Checkout SMTP] Warning: SMTP email configurations (SMTP_USER / SMTP_PASS) are not populated in environment secrets.");
        return res.status(200).json({
          status: "success",
          token: secureToken,
          delivered: false,
          warning: "SMTP Credentials not configured. Using fallback sandbox fulfillment.",
          message: `Your sandbox order was successfully authorized! To send actual emails, please go to the 'Secrets / Environment' panel in Google AI Studio and configure SMTP_USER and SMTP_PASS.`,
          details: { name, email, paymentMethod }
        });
      }

      // Create reusable transporter object using SSL/TLS
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"${fromName}" <${smtpUser}>`,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Checkout API] Email successfully delivered to ${email}. MessageId: ${info.messageId}`);
      return res.status(200).json({
        status: "success",
        token: secureToken,
        delivered: true,
        messageId: info.messageId,
        message: "A secure download link has been sent directly to your registered email address!"
      });

    } catch (error: any) {
      console.error("[Checkout API Error]", error);
      return res.status(500).json({
        error: "Internal server error occurred processing order fulfillment.",
        details: error.message
      });
    }
  });

  // Verify signed token endpoint
  app.post("/api/verify-payment", rateLimiter(60 * 1000, 45), (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Token missing" });
    }
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
  });

  // Verify license key endpoint
  app.post("/api/verify-license", rateLimiter(60 * 1000, 20), (req, res) => {
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
  });

  // Secure mapped asset download links endpoint
  app.post("/api/get-download-link", rateLimiter(60 * 1000, 40), (req, res) => {
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
  });


  // Vite development vs production serving setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Core Node running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();

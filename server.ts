import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import Razorpay from "razorpay";
import { DELIVERY_CONFIG } from "./src/config/delivery-config";

dotenv.config({ override: true });

// Private mapper of premium assets - dynamically sourced from centralized configuration file
const PREMIUM_DOWNLOADS = DELIVERY_CONFIG.PREMIUM_DOWNLOADS_DATABASE;

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
    
    // Strict 1-hour session expiration limit (3,600,000 milliseconds)
    if (decodedBody && decodedBody.timestamp) {
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - decodedBody.timestamp > oneHour) {
        console.warn(`[Token Verification] Security token expired. Age: ${Math.round((Date.now() - decodedBody.timestamp) / 1000)}s`);
        return null;
      }
    }
    
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

  // API Route to dynamically pre-generate Razorpay orders
  app.post("/api/create-order", rateLimiter(60 * 1000, 30), async (req, res) => {
    try {
      const { amount, currency, receipt } = req.body;

      if (!amount) {
        return res.status(400).json({ error: "Missing purchase amount paise denomination." });
      }

      const paiseAmount = Number(amount);
      if (isNaN(paiseAmount) || paiseAmount < 100) {
        return res.status(400).json({ error: "Amount must be a valid number of at least 100 paise." });
      }

      const rawKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_T1q3OJICXJ7oPT";
      const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "rDi0dwvg2BoYlRswmCb5mfAq";

      // Sanitize keys to remove any trailing whitespaces, carriage returns, or surrounding quotes
      const keyId = rawKeyId.trim().replace(/^["']|["']$/g, "");
      const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, "");

      console.log(`[Create Order Backend] Sanitized Razorpay Key ID: "${keyId.substring(0, 12)}..." (Length: ${keyId.length}), Secret Length: ${keySecret.length}`);

      if (!keyId || !keySecret) {
        console.error("[Create Order API] Razorpay key/secret environment configurations are unassigned.");
        return res.status(500).json({ error: "Razorpay provider credentials are not assigned on host environments." });
      }

      console.log(`[Create Order Backend] Initializing Razorpay wrapper`);
      const RazorpayConstructor = (Razorpay as any).default || Razorpay;
      const razorpay = new RazorpayConstructor({
        key_id: keyId,
        key_secret: keySecret,
      });

      const orderOptions = {
        amount: paiseAmount,
        currency: currency || "INR",
        receipt: receipt || `rec_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
      };

      console.log("[Create Order Backend] Creating Razorpay backend order entity draft:", orderOptions);
      const order = await razorpay.orders.create(orderOptions);

      console.log(`[Create Order Backend] Order registration succeeded. Reference Token: ${order.id}`);
      return res.status(200).json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (err: any) {
      console.error("[Create Order Exception Hook] Detailed error:", err);
      let errorDetail = err?.message || String(err);
      if (err?.error && typeof err.error === "object") {
        errorDetail = err.error.description || err.error.message || JSON.stringify(err.error);
      } else if (err?.description) {
        errorDetail = err.description;
      }
      return res.status(500).json({
        error: "Failed to create dynamic backend Razorpay order sequence.",
        details: errorDetail
      });
    }
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

  // Common helper logic for fulfilling paid user orders
  async function fulfillOrder(name: string, email: string, paymentMethod: string) {
    const tokenPayload = {
      name,
      email,
      paid: true,
      method: paymentMethod || "card",
      timestamp: Date.now()
    };
    const secureToken = createSecureToken(tokenPayload);

    const smtpHost = process.env.SMTP_HOST || DELIVERY_CONFIG.SMTP.DEFAULT_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || String(DELIVERY_CONFIG.SMTP.DEFAULT_PORT), 10);
    const smtpUser = process.env.SMTP_USER || DELIVERY_CONFIG.SMTP.DEFAULT_SENDER_USER;
    const smtpPass = process.env.SMTP_PASS || DELIVERY_CONFIG.SMTP.DEFAULT_SENDER_PASS;
    const fromName = process.env.FROM_NAME || DELIVERY_CONFIG.SMTP.DEFAULT_FROM_NAME;

    const emailSubject = (DELIVERY_CONFIG.SMTP.EMAIL_SUBJECT || `🚀 Your Video Editing Mega Bundle is Ready, {name}!`).replace("{name}", name);

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
            
            <a class="download-row" href="${DELIVERY_CONFIG.ALL_IN_ONE_DOWNLOAD_LINK}" target="_blank" style="background-color: #10b981; border: 1px solid #10b981; color: #000000; font-weight: bold; text-align: center; text-decoration: none; display: block; padding: 14px; border-radius: 8px; margin-bottom: 12px; font-size: 14px;">
              ⚡ DOWNLOAD ALL-IN-ONE EDITING PACK (56 GB)
            </a>
            
            <a class="download-row" href="${process.env.APP_URL || 'http://localhost:3000'}/vault?code=VEMB-2026-X779A" target="_blank" style="text-align: center; display: block;">
              📁 EXPLORE INDIVIDUAL CABINETS & MODULES
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
      return {
        secureToken,
        delivered: false,
        warning: "SMTP Credentials not configured. Using fallback sandbox fulfillment.",
        message: `Your sandbox order was successfully authorized! To send actual emails, please go to the 'Secrets / Environment' panel in Google AI Studio and configure SMTP_USER and SMTP_PASS.`,
        details: { name, email, paymentMethod }
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${smtpUser}>`,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`[Checkout API] Email successfully delivered to ${email}. MessageId: ${info.messageId}`);
      return {
        secureToken,
        delivered: true,
        messageId: info.messageId,
        message: "A secure download link has been sent directly to your registered email address!"
      };
    } catch (error: any) {
      console.error("[Checkout SMTP Error]", error);
      return {
        secureToken,
        delivered: false,
        error: error.message,
        message: "Payment success, but email delivery encountered a terminal SMTP failure. Access has been generated."
      };
    }
  }

  // API Route for confirming order and sending Nodemailer email
  app.post("/api/checkout", rateLimiter(60 * 1000, 15), async (req, res) => {
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
  });

  // Verify signed token endpoint
  app.post("/api/verify-payment", rateLimiter(60 * 1000, 45), async (req, res) => {
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

      const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "rDi0dwvg2BoYlRswmCb5mfAq";
      const keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, "");
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

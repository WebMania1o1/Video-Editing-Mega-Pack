/**
 * Delivery and Email Configuration File
 * 
 * Centralized settings for:
 * 1. NODEMAILER / SMTP CONFIGURATION (For sending transaction emails)
 * 2. EDITING PACK DOWNLOAD LINKS (Direct & Custom cabinets)
 * 3. PREMIUM DIGITAL VAULT ACCESS MAPPINGS
 * 
 * Edit this file to easily modify download URLs, emails, branding, and credentials
 * after publishing the web application!
 */

export const DELIVERY_CONFIG = {
  // =========================================================================
  // 1. MASTER ALL-IN-ONE EDITING PACK DOWNLOAD LINK
  // =========================================================================
  /**
   * This is your main link for the "Editing Pack All-in-One" file.
   * Modifying this link updates the download button in both the automated
   * post-purchase emails and the dedicated Members Vault screens.
   */
  ALL_IN_ONE_DOWNLOAD_LINK: "https://drive.google.com/file/d/1sIJ5rWp0Gv-oSZGCnGwJ2N_EKtgUT0I2/view?usp=drive_link",

  // =========================================================================
  // 2. NODEMAILER SMTP DETAILS
  // =========================================================================
  /**
   * SMTP Server configurations. These fallbacks will be used if your
   * environment/secrets variables (SMTP_USER, SMTP_PASS, etc.) are unpopulated.
   */
  SMTP: {
    DEFAULT_HOST: "smtp.gmail.com",
    DEFAULT_PORT: 465,
    DEFAULT_SECURE: true, // true for 465, false for other ports
    
    // Default Sender Email profile details
    DEFAULT_FROM_NAME: "EditorsMega Support Team",
    DEFAULT_SENDER_USER: "info@editorsmega.com", // Replace with your standard sending email
    DEFAULT_SENDER_PASS: "",                     // Replace with your standard App Password (16 chars)
    
    EMAIL_SUBJECT: "🚀 Your Video Editing Mega Bundle is Ready!",
  },

  // =========================================================================
  // 3. SECURE ASSETS & PREMIUM DIGITAL VAULT REPOSITORY MAPPINGS
  // =========================================================================
  /**
   * Complete download link dictionary mapped to individual cabinet elements that
   * can be accessed securely by paying customers from the Members Vault.
   */
  PREMIUM_DOWNLOADS_DATABASE: {
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
    
    // Cabinet-level mappings
    "cabinet-1": "https://drive.google.com/drive/folders/16o2za632lIzOetXMJlYGg2yv7wKMcfvF",
    "cabinet-2": "https://drive.google.com/drive/folders/1pJfy2AhAxdBNBuFuPcat3SkvOXqwjnHX",
    "cabinet-3": "https://drive.google.com/drive/folders/1CJ577VzDuntaGD10RDtgE9ISHAs4JI7O",
    "cabinet-4": "https://drive.google.com/drive/folders/1njKTkkYmDvF3YN2dk4KMmXlgFaUkJp8J"
  } as Record<string, string>
};

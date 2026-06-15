/**
 * Razorpay Payment Configuration File
 * 
 * This file centralizes all Razorpay credential fallbacks, checkout UI pricing,
 * merchant branding, and payment options. 
 * 
 * Edit this file to modify how the Razorpay payment details and dialog behaves 
 * in the frontend after publishing.
 */

export const RAZORPAY_CONFIG = {
  // =========================================================================
  // 1. CREDENTIALS AND API KEYS
  // =========================================================================
  /**
   * Default Razorpay Client Key ID (Starts with "rzp_test_" or "rzp_live_").
   * This is used as a local fallback if environment variables are not loaded.
   */
  DEFAULT_KEY_ID: 'rzp_test_zSgJb2pAbA9G8H',

  /**
   * Default Currencies used for transactions.
   * "INR" is recommended for standard Razorpay checkout integrations.
   */
  DEFAULT_CURRENCY: 'INR',

  // =========================================================================
  // 2. PRICING & PAYMENT AMOUNT
  // =========================================================================
  /**
   * Payment amounts configured in standard subunits (e.g. paisa for INR, cents for USD).
   * - 849 INR = 84900 Paisa (849 Rupees)
   * - 9 USD = 900 Cents ($9)
   */
  AMOUNTS: {
    INR: 84900, // Rs. 849
    USD: 900,   // $9
  },

  // =========================================================================
  // 3. MERCHANT BRANDING & CHECKOUT OPTIONS
  // =========================================================================
  /**
   * Customization options for the Razorpay standard portal window layout.
   */
  MERCHANT_INFO: {
    /**
     * The name of your store or brand shown at the top of the Razorpay checkout modal.
     */
    NAME: 'Editors Mega Bundle',

    /**
     * Package description text shown under the brand name.
     */
    DESCRIPTION: 'Lifetime Access License Key Cabinet',

    /**
     * Logo image asset URL shown inside the Razorpay payment window.
     */
    LOGO_IMAGE_URL: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcTJtdW5wOGlzODgxbzdkNjBpdnJ2YXBseDVydDVkdzN4ZDBtZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/273P92MBOqLiU/giphy.gif',

    /**
     * Primary accent color (hex format) used to style the Razorpay action button.
     * Default: Violet (#7c3aed), matching the application's premium aesthetics.
     */
    THEME_COLOR: '#7c3aed',
  },

  // =========================================================================
  // 4. METADATA & DASHBOARD NOTES
  // =========================================================================
  /**
   * Internal tracking notes attached to individual transactions.
   * Useful for auditing orders inside the Razorpay Merchant Dashboard.
   */
  NOTES: {
    PRODUCT: 'Editors Mega Bundle',
  }
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Shield, Lock, CreditCard, Sparkles, AlertCircle, Smartphone } from 'lucide-react';
import { PricingPlan } from '../types';
import { RAZORPAY_CONFIG } from '../config/razorpay';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan;
  onSuccess?: (name: string, email: string, token: string) => void;
}

type PaymentMethod = 'paypal' | 'razorpay';

export default function CheckoutModal({ isOpen, onClose, plan, onSuccess }: CheckoutModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);

  // Razorpay Sandbox Simulator Interactive States
  const [showRazorpaySimulator, setShowRazorpaySimulator] = useState(false);
  const [simTab, setSimTab] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [simCardNum, setSimCardNum] = useState('4111 1111 1111 1111');
  const [simCardExpiry, setSimCardExpiry] = useState('12/28');
  const [simCardCvv, setSimCardCvv] = useState('777');
  const [simUpiId, setSimUpiId] = useState('');
  const [simBank, setSimBank] = useState('SBI');
  const [simProgress, setSimProgress] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [simError, setSimError] = useState('');

  React.useEffect(() => {
    if (name) {
      setSimUpiId(`${name.toLowerCase().replace(/[^a-z]/g, '') || 'editor'}@okaxis`);
    }
  }, [name]);

  const downloadSecureAsset = async (assetId: string) => {
    const tokenToUse = sessionToken || localStorage.getItem('vemb_token');
    if (!tokenToUse) {
      alert("Verification session expired. Please verify your license key again.");
      return;
    }
    setDownloadingAssetId(assetId);
    try {
      const res = await fetch('/api/get-download-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToUse, assetId })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        alert(data.error || "Unable to retrieve download authorization.");
      }
    } catch (e) {
      console.error(e);
      alert("A network error occurred retrieving your secure download link.");
    } finally {
      setDownloadingAssetId(null);
    }
  };

  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState('');

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayError, setRazorpayError] = useState('');

  const [config, setConfig] = useState<{ paypalClientId: string; razorpayKeyId: string; razorpayCurrency: string } | null>(null);

  // Fetch runtime payment configuration from server on mount
  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/payment-config')
        .then(res => res.json())
        .then(data => {
          setConfig(data);
        })
        .catch(err => {
          console.error("Failed to load runtime payment configurations:", err);
          setConfig({
            paypalClientId: 'sb',
            razorpayKeyId: RAZORPAY_CONFIG.DEFAULT_KEY_ID,
            razorpayCurrency: RAZORPAY_CONFIG.DEFAULT_CURRENCY
          });
        });
    }
  }, [isOpen]);

  // Automatic PayPal Smart Buttons SDK Dynamic Loader
  React.useEffect(() => {
    if (!isOpen || paymentMethod !== 'paypal' || !config) {
      setPaypalLoaded(false);
      return;
    }

    const hasValidDetails = name.trim().length >= 2 && email.includes('@') && email.includes('.');
    if (!hasValidDetails) {
      setPaypalLoaded(false);
      return;
    }

    let active = true;
    const clientId = config.paypalClientId;
    const scriptId = 'paypal-sdk-script';

    const renderPaypalButtons = () => {
      const paypalInstance = (window as any).paypal;
      if (!paypalInstance) {
        if (active) {
          setPaypalError('PayPal secure library not found in active browser context.');
        }
        return;
      }

      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = ''; // Prevent multiple redundant buttons
      }

      try {
        paypalInstance.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '9.00', // Our premium video editing mega bundle special price
                  currency_code: 'USD'
                },
                description: `Editors Mega Bundle Access License for ${email}`
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            setIsSubmitting(true);
            try {
              const details = await actions.order.capture();
              console.log('PayPal transaction completed successfully:', details);

              // Capture name and email used in checkout
              const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name,
                  email,
                  paymentMethod: 'paypal',
                  paypalOrderId: details.id,
                  paypalDetails: details
                }),
              });

              const dataJson = await response.json();
              console.info('PayPal API delivery response:', dataJson);

              if (response.ok && dataJson.token) {
                setSessionToken(dataJson.token);
                localStorage.setItem('vemb_token', dataJson.token);
                setIsSuccess(true);
                if (onSuccess) {
                  onSuccess(name, email, dataJson.token);
                }
              } else {
                alert(dataJson.error || 'Server payment verification failed. Please contact support.');
              }
            } catch (err: any) {
              console.error('PayPal Order Capture Exception:', err);
              alert('Error verifying transactions with payment processors. Access blocked.');
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (err: any) => {
            console.error('PayPal layout trigger error:', err);
            if (active) {
              setPaypalError('Validation failed with PayPal servers. Please restart checkout.');
            }
          }
        }).render('#paypal-button-container');

        if (active) {
          setPaypalLoaded(true);
          setPaypalError('');
        }
      } catch (err: any) {
        console.warn('Buttons render trigger fail:', err);
      }
    };

    // Script injection hook
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => {
        renderPaypalButtons();
      };
      script.onerror = () => {
        if (active) {
          setPaypalError('PayPal SDK security check failed to respond.');
        }
      };
      document.body.appendChild(script);
    } else {
      // Script is already in DOM, check or mount directly
      if ((window as any).paypal) {
        const timer = setTimeout(() => {
          renderPaypalButtons();
        }, 80);
        return () => clearTimeout(timer);
      } else {
        const checkInterval = setInterval(() => {
          if ((window as any).paypal) {
            renderPaypalButtons();
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
    }

    return () => {
      active = false;
    };
  }, [paymentMethod, name, email, isOpen, config]);

  // Dynamic Razorpay SDK Script Loader with resilient context presence check
  React.useEffect(() => {
    if (!isOpen || !config) {
      setRazorpayLoaded(false);
      return;
    }

    let active = true;
    const scriptId = 'razorpay-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onerror = () => {
        if (active) {
          setRazorpayError('Could not establish connection to Razorpay billing servers.');
        }
      };
      document.body.appendChild(script);
    }

    // Continuously check for the presence of the global Razorpay constructor
    const checkInterval = setInterval(() => {
      if ((window as any).Razorpay) {
        if (active) {
          setRazorpayLoaded(true);
          setRazorpayError('');
        }
        clearInterval(checkInterval);
      }
    }, 100);

    // Timeout check failure if it takes longer than 10 seconds
    const timeoutTimer = setTimeout(() => {
      clearInterval(checkInterval);
      if (active && !(window as any).Razorpay) {
        setRazorpayError('Razorpay checkout library did not resolve correctly. Please retry.');
      }
    }, 10000);

    return () => {
      active = false;
      clearInterval(checkInterval);
      clearTimeout(timeoutTimer);
    };
  }, [isOpen, config]);

  const handleRazorpayVerification = async (paymentId: string, orderId: string, signature: string) => {
    setIsSubmitting(true);
    console.log('Sending Razorpay success params to verify endpoint:', paymentId, orderId, signature);
    setRazorpayError('');
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature
        }),
      });

      const dataJson = await res.json();
      console.info('Verify payment response:', dataJson);

      if (res.ok && dataJson.token) {
        setSessionToken(dataJson.token);
        localStorage.setItem('vemb_token', dataJson.token);
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(name, email, dataJson.token);
        }
      } else {
        alert(dataJson.error || 'Payment signature verification failed. Authorization denied.');
      }
    } catch (err: any) {
      console.error('Razorpay verification error:', err);
      alert('Failed to verify secure transaction signature with billing nodes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayFulfillment = async (paymentId: string, details: any) => {
    setIsSubmitting(true);
    console.log('Razorpay sandbox simulated transaction completed and sending to fulfillment API:', paymentId, details);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          paymentMethod: 'razorpay',
          razorpayPaymentId: paymentId,
          razorpayDetails: details
        }),
      });

      const dataJson = await res.json();
      console.info('Razorpay API response:', dataJson);

      if (res.ok && dataJson.token) {
        setSessionToken(dataJson.token);
        localStorage.setItem('vemb_token', dataJson.token);
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess(name, email, dataJson.token);
        }
      } else {
        alert(dataJson.error || 'Payment validation failed on servers. Access denied.');
      }
    } catch (err: any) {
      console.error('Razorpay Fulfillment verification error:', err);
      alert('Network timeout validating Razorpay authorization tokens.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    const hasValidDetails = name.trim().length >= 2 && email.includes('@') && email.includes('.');
    if (!hasValidDetails) {
      alert('Please fill out your Full Name and Delivery Email before starting payment.');
      return;
    }

    const razorpayKey = config?.razorpayKeyId || RAZORPAY_CONFIG.DEFAULT_KEY_ID;
    const currency = config?.razorpayCurrency || RAZORPAY_CONFIG.DEFAULT_CURRENCY;
    const amountVal = currency === 'INR' ? RAZORPAY_CONFIG.AMOUNTS.INR : RAZORPAY_CONFIG.AMOUNTS.USD;

    // Fallback to simulator if the key is generic ('sb'), the default documentation placeholder key, or completely missing
    const isPlaybackPlaceholder = razorpayKey === 'sb' || razorpayKey === RAZORPAY_CONFIG.DEFAULT_KEY_ID || !razorpayKey;

    if (isPlaybackPlaceholder || !(window as any).Razorpay) {
      console.info("Using Secure Sandbox Simulation for empty/missing/default security configuration keys.");
      setSimError('');
      setSimProgress('idle');
      setShowRazorpaySimulator(true);
      return;
    }

    setIsSubmitting(true);
    setRazorpayError('');
    console.info(`[Razorpay Checkout] Creating order on server: Amount=${amountVal} ${currency}`);

    let orderId = '';
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountVal,
          currency: currency,
          receipt: `rec_ch_${Date.now()}`
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        const detailMsg = orderData.details ? `: ${orderData.details}` : '';
        throw new Error(`${orderData.error || 'Failed to create payment order'}${detailMsg}`);
      }

      orderId = orderData.order_id;
      console.info(`[Razorpay Checkout] Backend order created successfully: ${orderId}`);
    } catch (err: any) {
      console.error('[Razorpay Order Creation Error]', err);
      setRazorpayError(`Order Creation Failed: ${err.message || 'Internal communication latency.'}`);
      setIsSubmitting(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: amountVal,
      currency: currency,
      name: RAZORPAY_CONFIG.MERCHANT_INFO.NAME,
      description: RAZORPAY_CONFIG.MERCHANT_INFO.DESCRIPTION,
      image: RAZORPAY_CONFIG.MERCHANT_INFO.LOGO_IMAGE_URL,
      order_id: orderId,
      handler: async function (response: any) {
        console.log('[Razorpay Checkout Success Response]', response);
        await handleRazorpayVerification(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
      },
      prefill: {
        name: name,
        email: email,
      },
      notes: {
        product: RAZORPAY_CONFIG.NOTES.PRODUCT,
        email: email
      },
      theme: {
        color: RAZORPAY_CONFIG.MERCHANT_INFO.THEME_COLOR
      },
      modal: {
        ondismiss: function () {
          console.warn('[Razorpay Checkout] User dismissed payment modal.');
          setIsSubmitting(false);
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Razorpay process failed:', resp.error);
        setRazorpayError(`Processing error: ${resp.error.description || 'Transaction declined.'}`);
        setIsSubmitting(false);
      });
      setIsSubmitting(false);
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay constructor crashed, loading simulator:', err);
      setSimError('');
      setSimProgress('idle');
      setShowRazorpaySimulator(true);
      setIsSubmitting(false);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'VIP85' || promoCode.trim().toUpperCase() === 'META85' || promoCode.trim().toUpperCase() === 'VIP95' || promoCode.trim().toUpperCase() === 'META95') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Note: the 95% discount is already applied to our $9 offer price!');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      alert('Please fill out your name and email directory to secure your delivery link!');
      return;
    }
    if (paymentMethod === 'paypal') {
      alert('Please click the secure gold PayPal buttons below to proceed with checkout.');
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl md:p-8 flex flex-col max-h-[85vh] sm:max-h-[88vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 rounded-full bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {!isSuccess ? (
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 scrollbar-thin min-h-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950/20 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <span className="rounded-full bg-violet-955/20 border border-violet-800/20 px-2.5 py-0.5 text-xs font-semibold text-violet-400">
                      SECURE CHECKOUT
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-550">
                      <Lock size={10} className="text-emerald-500" /> SSL Encrypted
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">Secure Order Access</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Fill in your details to immediately trigger your premium asset pack downloads.
                  </p>
                </div>

                {/* Main Order Item */}
                <div className="rounded-xl border border-zinc-900 p-4 mb-5 flex justify-between items-center bg-gradient-to-r from-zinc-950 to-[#0e0e11]">
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">{plan.name}</h4>
                    <p className="text-[11px] text-zinc-400">Instant Digital Access • Life License</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 line-through mr-1.5">{plan.originalPrice}</span>
                    <span className="font-mono text-lg font-bold text-violet-400">{plan.currentPrice}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullname" className="block text-xs font-medium text-zinc-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullname"
                      name="name"
                      autoComplete="name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/30 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1">
                      Email Address (For Delivery)
                    </label>
                    <input
                      id="email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-zinc-850 bg-zinc-900/30 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                    <span className="text-[10px] text-zinc-450 mt-1 block">
                      Make sure your email is typed correctly; this is where we send your Google Drive links!
                    </span>
                  </div>

                  {/* Payment Gateway Tabs */}
                  <div>
                    <span className="block text-xs font-medium text-zinc-300 mb-2">
                       Select Payment Network
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'paypal', label: 'PayPal', sub: 'Global Cards / Account' },
                        { id: 'razorpay', label: 'UPI / Credit Card / Netbanking', sub: 'Secured by Razorpay' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                          className={`flex flex-col items-center justify-center rounded-lg border p-2.5 transition-all cursor-pointer ${
                            paymentMethod === item.id
                              ? 'border-violet-500 bg-violet-955/20 text-white shadow-sm shadow-violet-500/10'
                              : 'border-zinc-850 bg-zinc-900/20 hover:bg-zinc-850/50 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{item.label}</span>
                          <span className="text-[8px] text-zinc-500 scale-90">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Integration instructions block for developer setting up */}
                  <div className="rounded-lg bg-violet-955/10 border border-violet-850/15 p-3">
                    <p className="text-[10px] text-violet-350 leading-relaxed flex gap-1.5">
                      <Shield size={12} className="shrink-0 mt-0.5 text-violet-405 text-violet-400" />
                      <span>
                        <strong>Integration Note:</strong> This form processes real sandbox orders. You can configure individual custom payment redirect links (PayPal, or UPI alias) quickly. Simply locate and replace the parameters inside <code className="text-white hover:underline">/src/data.ts</code>.
                      </span>
                    </p>
                  </div>

                  {/* Promo Input */}
                  <div className="flex gap-2">
                    <input
                      id="promo_code_no_autofill"
                      name="promo_code_no_autofill"
                      autoComplete="new-password"
                      data-lpignore="true"
                      type="text"
                      placeholder="HAVE A COUPON?"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-850 bg-zinc-900/30 px-3 py-1.5 text-xs text-white uppercase tracking-wider placeholder-zinc-500 outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="rounded-lg bg-zinc-800 px-3 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check size={12} /> Promo APPLIED! Extra VIP customer updates unlocked.
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-rose-450 leading-tight">
                      {promoError}
                    </p>
                  )}                  {/* Action Purchase Container */}
                  <div className="mt-4">
                    {paymentMethod === 'paypal' ? (
                      (() => {
                        const hasVal = name.trim().length >= 2 && email.includes('@') && email.includes('.');
                        if (!hasVal) {
                          return (
                            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4.5 text-center text-xs text-zinc-400 select-none">
                              <AlertCircle size={18} className="mx-auto mb-2 text-violet-400 animate-pulse" />
                              <span className="font-semibold block text-zinc-300 mb-1">Account Details Required</span>
                              Please enter your Full Name and Delivery Email above. Secure interactive PayPal buttons will load instantly here once filled.
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-4">
                            {paypalError && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{paypalError}</span>
                              </div>
                            )}

                            {!paypalLoaded && !paypalError && (
                              <div className="flex flex-col items-center justify-center p-6 text-zinc-400 gap-2 border border-zinc-850 bg-zinc-950/60 rounded-xl">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400">Securing PayPal Checkout...</span>
                              </div>
                            )}

                            <div 
                              id="paypal-button-container" 
                              className={`transition-all duration-300 ${paypalLoaded ? 'opacity-100' : 'opacity-30 pointer-events-none'}`} 
                            />
                            
                            <p className="text-[10px] text-center text-zinc-550 font-mono select-none">
                              🛡️ Secured by PayPal Core Inc. • Direct download authorization on approval
                            </p>
                          </div>
                        );
                      })()
                    ) : (
                      (() => {
                        const hasVal = name.trim().length >= 2 && email.includes('@') && email.includes('.');
                        if (!hasVal) {
                          return (
                            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4.5 text-center text-xs text-zinc-400 select-none">
                              <AlertCircle size={18} className="mx-auto mb-2 text-violet-400 animate-pulse" />
                              <span className="font-semibold block text-zinc-300 mb-1">Account Details Required</span>
                              Please enter your Full Name and Delivery Email above. Secured Razorpay checkout gateway triggers here once filled.
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-4">
                            {razorpayError && (
                              <div className="space-y-3">
                                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex flex-col gap-2">
                                  <div className="flex items-center gap-2 font-semibold">
                                    <AlertCircle size={15} className="shrink-0 text-rose-400" />
                                    <span>Razorpay Checkout Intercepted</span>
                                  </div>
                                  <span className="text-zinc-300 text-[11px] leading-relaxed block">
                                    {razorpayError}
                                  </span>
                                  <p className="text-zinc-400 text-[10.5px] leading-relaxed pt-1.5 border-t border-rose-500/10">
                                    This "Authentication failed" alert means the active Razorpay API Keys are invalid, inactive, or expired.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRazorpayError("");
                                    setSimError("");
                                    setSimProgress("idle");
                                    setShowRazorpaySimulator(true);
                                  }}
                                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-violet-400 hover:text-violet-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-md"
                                >
                                  ⚡ Bypass Gateway & Use Sandbox Simulator
                                </button>
                              </div>
                            )}

                            {!razorpayLoaded && !razorpayError && (
                              <div className="flex flex-col items-center justify-center p-6 text-zinc-400 gap-2 border border-zinc-850 bg-zinc-950/60 rounded-xl">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400">Loading Razorpay Secure Hook...</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleRazorpayPayment}
                              disabled={isSubmitting || !razorpayLoaded}
                              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 py-3.5 font-bold tracking-wide text-white transition-all shadow-lg shadow-violet-600/15 hover:shadow-violet-600/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2 font-mono">
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  AUTHORIZING PAYMENT FLUX...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2 uppercase tracking-wider text-sm font-display">
                                  <CreditCard size={16} /> 
                                  {(config?.razorpayCurrency || 'INR') === 'INR' 
                                    ? `Pay via Razorpay (₹849)` 
                                    : `Pay via Razorpay (${plan.currentPrice})`
                                  }
                                </span>
                              )}
                            </button>

                            <p className="text-[10px] text-center text-zinc-550 font-mono select-none">
                              🛡️ Secured by Razorpay Core • Direct download authorization on successful approval
                            </p>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </form>

                {/* Security Trust Badges */}
                <div className="mt-5 flex items-center justify-center gap-4 border-t border-zinc-900 pt-4 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1 focus:outline-none">
                    <Lock size={12} className="text-emerald-500" /> 256-bit AES Encryption
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-violet-400 animate-pulse" /> Instant Cloud Delivery
                  </span>
                </div>
              </div>
            ) : (
              /* Success delivery window */
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin min-h-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950/20 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-green-600 text-white shadow-lg shadow-emerald-500/20 select-none">
                    <Check size={28} className="stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">Order Authorized!</h3>
                  <p className="text-sm text-zinc-300 mt-2">
                    Congratulations <strong className="text-white">{name}</strong>! We have authenticated your digital credentials and sent your lifetime access dashboard links directly to <strong className="text-violet-400 font-mono font-medium">{email}</strong>.
                  </p>

                  {/* Instant Action File Download Panel */}
                  <div className="mt-8 rounded-2xl border border-zinc-850 p-5 text-left bg-gradient-to-b from-zinc-950 to-[#0e0e11]">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-violet-400 uppercase mb-3 flex items-center gap-1 select-none">
                      <Sparkles size={12} /> INSTANT SECURE FILE DOWNLOAD CABINET
                    </h4>
                    <p className="text-[11px] text-zinc-450 mb-4">
                      Skip email latency. You can trigger the main direct downloads right here from this secure workspace instant sandbox token block.
                    </p>

                    <div className="space-y-2.5 pb-2">
                      {[
                        { assetId: 'cabinet-1', name: '1. PRESETS & LUTs PACK (Direct Mirror Link)', size: '2.4 GB', color: 'text-violet-400' },
                        { assetId: 'cabinet-2', name: '2. HOLLYWOOD SFX LIBRARY (WAV Master)', size: '1.8 GB', color: 'text-fuchsia-400' },
                        { assetId: 'cabinet-3', name: '3. MOGRT TITLES & SVG INSTANTS', size: '940 MB', color: 'text-orange-400' },
                        { assetId: 'cabinet-4', name: '4. INSTALLATION TUTORIAL MANUALS (PDF)', size: '18 MB', color: 'text-emerald-400' }
                      ].map((file, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => downloadSecureAsset(file.assetId)}
                          disabled={downloadingAssetId === file.assetId}
                          className="w-full flex items-center justify-between rounded-lg bg-black/40 border border-zinc-900 p-2.5 hover:border-zinc-800 hover:bg-black/60 transition-all text-xs text-zinc-200 group cursor-pointer text-left disabled:opacity-50"
                        >
                          <span className="truncate pr-4 group-hover:text-white transition-colors">
                            📁 {downloadingAssetId === file.assetId ? 'Authorizing secure download...' : file.name}
                          </span>
                          <span className={`font-mono text-[10px] font-bold ${file.color}`}>
                            {file.size}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={onClose}
                      className="rounded-xl w-full bg-zinc-850 hover:bg-zinc-800 py-2.5 text-xs font-semibold text-white transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Return to landing page
                    </button>
                    <p className="text-[10px] text-zinc-550 mt-3 select-none">
                      Your licenses are registered under code: <strong className="text-zinc-400">VEMB-2026-X779A</strong>
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Seamless Razorpay Checkout Sandbox Simulator Overlay */}
            <AnimatePresence>
              {showRazorpaySimulator && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="absolute inset-0 z-50 flex flex-col bg-[#0b0b0e] p-5 text-white overflow-y-auto"
                >
                  {/* Simulator Header */}
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-4 select-none">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm tracking-tighter text-white shadow-md shadow-violet-600/20">
                        R
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-100">Razorpay Secure Sandbox</h4>
                        <p className="text-[9px] font-mono text-emerald-400 font-semibold tracking-wide">● VERIFIED DEMO BILLING GATEWAY</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySimulator(false)}
                      className="rounded-full bg-white/5 p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Merchant Account Details and Total Pricing badge */}
                  <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-3.5 mb-4 flex items-center justify-between select-none">
                    <div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Merchant Account</p>
                      <p className="text-xs font-semibold text-zinc-300">EditorsMega Inc.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Amount Due</p>
                      <p className="text-sm font-black text-violet-400 font-mono tracking-tight">
                        {(config?.razorpayCurrency || 'INR') === 'INR' ? '₹849.00' : '$9.00'}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Sandbox errors if any during simulation */}
                  {simError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[11px] mb-4 flex items-start gap-2 max-w-full">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-450" />
                      <span className="leading-normal">{simError}</span>
                    </div>
                  )}

                  {/* Interactive Simulated Payment Mode Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl mb-4 text-xs select-none">
                    {[
                      { id: 'card', name: 'Card' },
                      { id: 'upi', name: 'UPI' },
                      { id: 'netbanking', name: 'Banks' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSimTab(tab.id as any);
                          setSimError('');
                        }}
                        className={`py-2 px-1 rounded-lg text-center font-semibold transition-all cursor-pointer ${
                          simTab === tab.id 
                            ? 'bg-zinc-850 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* Tab inputs and mock fields container */}
                  <div className="flex-1 bg-zinc-950/50 border border-zinc-900 rounded-xl p-4.5 mb-4 flex flex-col justify-center min-h-[160px]">
                    {simTab === 'card' && (
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Simulated Card Number (Fully Editable)</label>
                          <input 
                            type="text"
                            value={simCardNum}
                            onChange={(e) => setSimCardNum(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-violet-500 tracking-wider"
                            placeholder="4111 1111 2222 3333"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Expiry Code</label>
                            <input 
                              type="text"
                              value={simCardExpiry}
                              onChange={(e) => setSimCardExpiry(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-violet-500 text-center"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">CVV Code</label>
                            <input 
                              type="password"
                              value={simCardCvv}
                              onChange={(e) => setSimCardCvv(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-violet-500 text-center"
                              maxLength={4}
                              placeholder="***"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {simTab === 'upi' && (
                      <div className="space-y-3 text-center select-none">
                        <div className="inline-flex flex-col items-center p-3.5 bg-white rounded-xl mb-1 border border-zinc-200">
                          <div className="grid grid-cols-5 gap-0.5 h-14 w-14 bg-white p-1">
                            {[...Array(25)].map((_, idx) => (
                              <div 
                                key={idx} 
                                className={`h-full w-full ${
                                  (idx % 2 === 0 && idx % 3 === 0) || idx === 0 || idx === 4 || idx === 20 || idx === 24 || idx === 12 || idx === 8
                                    ? 'bg-black' 
                                    : 'bg-transparent'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[8px] font-mono text-zinc-700 mt-1.5 tracking-widest uppercase font-black">SCAN TEST DEMO QR</span>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1 font-bold">Or Type / Paste Virtual Private Address</label>
                          <input 
                            type="text"
                            value={simUpiId}
                            onChange={(e) => setSimUpiId(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs font-mono text-center text-zinc-200 outline-none focus:border-violet-500"
                            placeholder="username@upi"
                          />
                        </div>
                      </div>
                    )}

                    {simTab === 'netbanking' && (
                      <div className="space-y-2 select-none">
                        <label className="block text-[9px] font-mono text-zinc-550 uppercase tracking-widest mb-1.5 font-bold">Select Simulated Banking Core</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setSimBank(b)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between font-bold cursor-pointer ${
                                simBank === b 
                                  ? 'bg-violet-950/20 border-violet-500/60 text-violet-350' 
                                  : 'bg-zinc-950/70 border-zinc-900 text-zinc-400 hover:border-zinc-850'
                              }`}
                            >
                              <span>{b}</span>
                              {simBank === b && <Check size={11} className="text-violet-400 shrink-0 stroke-[2.5]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Actions Panel */}
                  <div className="space-y-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSimProgress('processing');
                        setSimError('');
                        setTimeout(() => {
                          setSimProgress('success');
                          setTimeout(() => {
                            setSimProgress('idle');
                            setShowRazorpaySimulator(false);
                            const mockPaymentId = "pay_sim_" + Math.random().toString(36).substring(2, 12);
                            handleRazorpayFulfillment(mockPaymentId, {
                              razorpay_payment_id: mockPaymentId,
                              simulated: true,
                              method: simTab,
                              details: {
                                simTab,
                                cardNum: simCardNum,
                                upiId: simUpiId,
                                bank: simBank
                              }
                            });
                          }, 950);
                        }, 1100);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-[0.98] transition-all font-display select-none"
                    >
                      <Shield size={14} className="shrink-0" />
                      Simulate Successful Payment ({(config?.razorpayCurrency || 'INR') === 'INR' ? '₹849' : '$9.00'})
                    </button>

                    <div className="grid grid-cols-2 gap-2 select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setSimProgress('processing');
                          setTimeout(() => {
                            setSimProgress('idle');
                            setSimError('The simulated transaction was declined by the bank authorization system. Please check details or retry.');
                          }, 900);
                        }}
                        className="rounded-xl border border-rose-950/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 py-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all"
                      >
                        Simulate Failure
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRazorpaySimulator(false)}
                        className="rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer active:scale-[0.98] transition-all"
                      >
                        Cancel Checkout
                      </button>
                    </div>
                  </div>

                  {/* Full Overlay Spinner indicator during network simulated delays */}
                  {simProgress === 'processing' && (
                    <div className="absolute inset-0 bg-[#08080a]/95 backdrop-blur-md z-55 flex flex-col items-center justify-center p-6 text-center select-none rounded-2xl">
                      <span className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-4" />
                      <p className="text-xs font-bold text-white tracking-widest uppercase">Connecting to Secure Sandbox...</p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono leading-relaxed">Fulfilling order key via cryptographic node systems</p>
                    </div>
                  )}

                  {simProgress === 'success' && (
                    <div className="absolute inset-0 bg-[#08080a] z-55 flex flex-col items-center justify-center p-6 text-center select-none rounded-2xl">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        <Check size={24} className="stroke-[3]" />
                      </div>
                      <p className="text-sm font-bold text-white tracking-wide">Signature Token Verified</p>
                      <p className="text-[10px] text-emerald-400 mt-1 font-mono">Generating download cabinet links...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Play,
  Award,
  Volume2,
  ShieldCheck,
  Palette,
  Smartphone,
  Clock,
  Download,
  ChevronDown,
  Check,
  Star,
  Lock,
  Layers,
  Compass,
  MoveRight,
  UserCheck,
  Tv,
  MonitorPlay,
  Youtube,
  Instagram,
  Briefcase,
  Mail,
  Sparkles,
  Info,
  ExternalLink,
  Flame,
  MousePointerClick
} from 'lucide-react';

import { INCLUDED_ASSETS, LOVE_REASONS, PREVIEWS, TARGET_SEGMENTS, TESTIMONIALS, FAQS, PRICING } from './data';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import CheckoutModal from './components/CheckoutModal';
import MembersVault from './components/MembersVault';
import PolicyModal from './components/PolicyModal';

// Static Icon Renderer mapping to prevent dynamic import bugs
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Zap': return <Zap className={className} />;
    case 'Play': return <Play className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Volume2': return <Volume2 className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Palette': return <Palette className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Download': return <Download className={className} />;
    case 'Check': return <Check className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Lock': return <Lock className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'MoveRight': return <MoveRight className={className} />;
    case 'UserCheck': return <UserCheck className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'MonitorPlay': return <MonitorPlay className={className} />;
    case 'Youtube': return <Youtube className={className} />;
    case 'Instagram': return <Instagram className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return <Sparkles className={className} />;
  }
};

const animContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const animItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'privacy' | 'terms' | 'refund' | 'contact'>('privacy');
  
  const [selectedPreview, setSelectedPreview] = useState(PREVIEWS[0]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Post-purchase customer credentials state
  const [hasPurchased, setHasPurchased] = useState(false);
  const [customerName, setCustomerName] = useState('Premium Director');
  const [customerEmail, setCustomerEmail] = useState('client-delivery@editorsmega.com');
  const [sessionToken, setSessionToken] = useState<string>(localStorage.getItem('vemb_token') || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Verify license or existing token on initial render mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('license');
    if (code) {
      const emailParam = params.get('email') || 'vip-member@editorsmega.com';
      fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, licenseKey: code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.token) {
          localStorage.setItem('vemb_token', data.token);
          setSessionToken(data.token);
          setCustomerName(data.name);
          setCustomerEmail(data.email);
          setHasPurchased(true);
          // Pure url rewrite to wipe codes from addresses
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          alert('Unauthorized or spent URL license code link.');
        }
      })
      .catch(err => {
        console.error("License parameter validation exception:", err);
      });
    } else {
      const token = localStorage.getItem('vemb_token');
      if (token) {
        fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionToken(token);
            setCustomerName(data.name || 'Creative Editor');
            setCustomerEmail(data.email || 'vip-member@editorsmega.com');
            setHasPurchased(true);
          } else {
            localStorage.removeItem('vemb_token');
            setSessionToken('');
            setHasPurchased(false);
          }
        })
        .catch(err => {
          console.error("Token session restoration exception:", err);
        });
      }
    }
  }, []);

  // Scarcity Live Timer (Minutes and Seconds)
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 52 });

  // Floating Social Proof Ticker State
  const [activeNotification, setActiveNotification] = useState<{ name: string; location: string; timeAgo: string } | null>(null);

  // Static Software List
  const softwares = [
    { name: 'Adobe Premiere Pro', badge: 'Fast Import' },
    { name: 'DaVinci Resolve', badge: 'Graded Node' },
    { name: 'Final Cut Pro X', badge: 'XML Supported' },
    { name: 'CapCut Desktop', badge: 'Popular' },
    { name: 'After Effects', badge: 'Pre-styled' },
    { name: 'Sony Vegas', badge: 'Drag-and-Drop' }
  ];

  // Scarcity countdown trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          // Loop the timer to stay highly compelling but never become 00:00 forever
          return { minutes: 15, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Floating buyer notifications ticker simulation
  useEffect(() => {
    const purchasers = [
      { name: 'Arjun M.', location: 'Mumbai, India', timeAgo: '12 seconds ago' },
      { name: 'Dustin S.', location: 'Austin, TX', timeAgo: '1 minute ago' },
      { name: 'Kira L.', location: 'London, UK', timeAgo: '45 seconds ago' },
      { name: 'Yuki T.', location: 'Tokyo, Japan', timeAgo: '3 minutes ago' },
      { name: 'Chloe B.', location: 'Sydney, Australia', timeAgo: '5 minutes ago' },
      { name: 'Rohan G.', location: 'Bengaluru, India', timeAgo: '30 seconds ago' },
      { name: 'Marcus V.', location: 'Berlin, Germany', timeAgo: '2 minutes ago' },
      { name: 'Elena R.', location: 'Madrid, Spain', timeAgo: '4 minutes ago' },
      { name: 'Liam N.', location: 'Toronto, Canada', timeAgo: '3 minutes ago' },
      { name: 'Jean-Pierre D.', location: 'Paris, France', timeAgo: '6 minutes ago' },
      { name: 'Sofia P.', location: 'São Paulo, Brazil', timeAgo: '45 seconds ago' },
      { name: 'Wei C.', location: 'Singapore', timeAgo: '1 minute ago' },
      { name: 'Mateo S.', location: 'Buenos Aires, Argentina', timeAgo: '8 minutes ago' },
      { name: 'Linnea K.', location: 'Stockholm, Sweden', timeAgo: '5 minutes ago' },
      { name: 'Alessandro M.', location: 'Milan, Italy', timeAgo: '2 minutes ago' },
      { name: 'Zoya K.', location: 'Dubai, UAE', timeAgo: '7 minutes ago' },
      { name: 'Noah B.', location: 'New York, NY', timeAgo: '15 seconds ago' },
      { name: 'Oliver F.', location: 'Auckland, New Zealand', timeAgo: '3 minutes ago' },
      { name: 'Grace H.', location: 'Chicago, IL', timeAgo: '4 minutes ago' },
      { name: 'Lucas W.', location: 'Amsterdam, Netherlands', timeAgo: '9 minutes ago' },
      { name: 'Dmitri G.', location: 'Warsaw, Poland', timeAgo: '6 minutes ago' },
      { name: 'Siddharth J.', location: 'New Delhi, India', timeAgo: '24 seconds ago' },
      { name: 'Amiya V.', location: 'Cape Town, South Africa', timeAgo: '5 minutes ago' },
      { name: 'Amelia T.', location: 'Los Angeles, CA', timeAgo: '1 minute ago' },
      { name: 'Kaito S.', location: 'Osaka, Japan', timeAgo: '2 minutes ago' },
      { name: 'Harper D.', location: 'Seattle, WA', timeAgo: '3 minutes ago' },
      { name: 'Elias B.', location: 'Vienna, Austria', timeAgo: '4 minutes ago' },
      { name: 'Isabella G.', location: 'Rome, Italy', timeAgo: '5 minutes ago' },
      { name: 'Nikhil K.', location: 'Hyderabad, India', timeAgo: '2 minutes ago' },
      { name: 'Zoe F.', location: 'Zurich, Switzerland', timeAgo: '8 minutes ago' },
      { name: 'Sebastian L.', location: 'Copenhagen, Denmark', timeAgo: '7 minutes ago' },
      { name: 'Min-Ji K.', location: 'Seoul, South Korea', timeAgo: '4 minutes ago' },
      { name: 'Finn O.', location: 'Dublin, Ireland', timeAgo: '3 minutes ago' },
      { name: 'Mia V.', location: 'Oslo, Norway', timeAgo: '6 minutes ago' },
      { name: 'Ethan P.', location: 'Denver, CO', timeAgo: '5 minutes ago' },
      { name: 'Victoria M.', location: 'Melbourne, Australia', timeAgo: '9 minutes ago' },
      { name: 'Hugo F.', location: 'Lisbon, Portugal', timeAgo: '4 minutes ago' },
      { name: 'Sarah W.', location: 'San Francisco, CA', timeAgo: '30 seconds ago' },
      { name: 'Andrej V.', location: 'Prague, Czechia', timeAgo: '8 minutes ago' },
      { name: 'Fatima A.', location: 'Doha, Qatar', timeAgo: '5 minutes ago' },
      { name: 'Ryan B.', location: 'London, UK', timeAgo: '10 minutes ago' },
      { name: 'Nisha S.', location: 'Mumbai, India', timeAgo: '7 minutes ago' },
      { name: 'Emma O.', location: 'Boston, MA', timeAgo: '12 seconds ago' },
      { name: 'Lucas P.', location: 'Lyon, France', timeAgo: '2 minutes ago' },
      { name: 'Xavier T.', location: 'Brussels, Belgium', timeAgo: '5 minutes ago' },
      { name: 'Anya S.', location: 'Munich, Germany', timeAgo: '3 minutes ago' }
    ];

    // Shuffling purchasers to prevent repetition sequence on reload
    const shuffled = [...purchasers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let currentIndex = 0;
    const showNotification = () => {
      setActiveNotification(shuffled[currentIndex]);
      currentIndex = (currentIndex + 1) % shuffled.length;

      // Hide notification after 5 seconds
      setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
    };

    // Trigger first message after 3 seconds
    const timer1 = setTimeout(showNotification, 4000);

    const interval = setInterval(() => {
      showNotification();
    }, 22000); // Popup every 22 seconds

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, []);

  if (hasPurchased) {
    return (
      <MembersVault 
        customerName={customerName} 
        customerEmail={customerEmail} 
        onBackToLanding={() => {
          setHasPurchased(false);
          setShowSuccessToast(false);
        }} 
        sessionToken={sessionToken}
        showWelcomeToast={showSuccessToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-violet-500 selection:text-white">
      
      {/* GLOBAL BACKGROUND AMBIENT GLOW FLUID GRID */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Cinematic Video Editing Workstation Background */}
        <div className="absolute top-0 left-0 w-full h-[780px] md:h-[980px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=80"
            alt="Professional Video Editing Studio Setup"
            className="w-full h-full object-cover opacity-[0.14] saturate-[0.8] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          {/* Fades to prevent text distraction and handle bottom blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/50 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
        </div>

        {/* Glowing floating ambient orbs */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-violet-900/10 blur-[150px] ambient-glow" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[50%] rounded-full bg-fuchsia-950/5 blur-[160px] ambient-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[70%] h-[50%] rounded-full bg-purple-950/10 blur-[140px] ambient-glow" style={{ animationDelay: '4s' }} />
        
        {/* Aesthetic grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* FIXED TOP SCARCITY HEADER TICKER BANNER FOR META ADS TRAFFIC */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 py-2 px-4 text-center text-xs font-semibold tracking-wider text-white shadow-lg flex items-center justify-center gap-2">
        <Flame size={14} className="animate-bounce" />
        <span className="uppercase text-[11px] font-display font-medium">
          STRICT LIMIT: Special 85% META Discount Active for next:
        </span>
        <span className="font-mono bg-black/40 text-orange-300 px-2.5 py-0.5 rounded border border-white/10 text-xs font-black shadow-inner">
          {timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="hidden sm:inline">| Over 14,281 premium bundles secured.</span>
      </div>

      {/* CORE FRAMEWORK NAVIGATION CONTROLLER (MINIMALIST LOGO + FAST SECURE ORDER BUTTON) */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-30 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center">
          {/* Logo element representation */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-orange-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Play size={14} className="text-white fill-white stroke-[3]" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-white uppercase bg-clip-text">
              EDITORS<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-black">MEGA</span>
            </span>
          </div>

          {/* Secure buyout utility links */}
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              142 Active Checkouts
            </span>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: '#27272a' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
            >
              Verify License
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, filter: 'brightness(1.05)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="relative hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-zinc-100 px-5 py-1.5 text-xs font-bold tracking-wide text-black transition-all shadow-lg shadow-white/5 active:scale-[0.98] cursor-pointer"
            >
              <Lock size={12} /> SECURE ORDER
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* HERO HERO COMPONENT STAGE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-16 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left message and value proposition */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={animContainer}
          className="lg:col-span-7 space-y-6"
        >
          <motion.div variants={animItem} className="inline-flex items-center gap-2 rounded-full bg-violet-950/20 border border-violet-800/30 px-3.5 py-1 text-slate-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-violet-400">
              THE ULTIMATE CREATIVE ASSET VAULT
            </span>
          </motion.div>

          <motion.h1 variants={animItem} className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-[1.08] text-white tracking-tight">
            Stop Editing From Scratch.<br />
            Create <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">Hollywood Grade</span> Videos in Minutes.
          </motion.h1>

          <motion.p variants={animItem} className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Unleash <strong>6,000+ ultimate drag-and-drop assets</strong>. Pre-mapped transitions, movie LUTs, custom sound effects, social templates, and cinematic titles designed to take your video production from basic to premium in one click. Compatible with all video editors.
          </motion.p>

          {/* Social Proof Star highlight */}
          <motion.div variants={animItem} className="flex flex-wrap gap-4 items-center pt-2 border-t border-zinc-900">
            <div className="flex -space-x-2.5">
              {[
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80',
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
              ].map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt="Editor avatar"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full border border-[#050505] object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-violet-400 text-violet-400" />
                ))}
                <span className="font-mono text-xs font-bold text-zinc-300 ml-1">4.96/5 Rating</span>
              </div>
              <p className="text-xs text-zinc-500">Trusted by 14,200+ editors, videographers and YouTube creators.</p>
            </div>
          </motion.div>

          {/* Call-to-action triggers */}
          <motion.div variants={animItem} className="flex flex-col sm:flex-row gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.025, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.975 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:brightness-110 px-8 py-4 font-bold tracking-wider text-white transition-all shadow-xl shadow-violet-600/20 active:scale-[0.98] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <span className="flex items-center justify-center gap-2 text-sm uppercase font-semibold">
                <Download size={16} className="stroke-[2.5]" /> SECURE DOWNLOAD NOW • $9
              </span>
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.025, backgroundColor: '#27272a' }}
              whileTap={{ scale: 0.975 }}
              href="#whats-included"
              className="rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-750 hover:bg-zinc-800 px-8 py-4 text-xs font-bold tracking-wider text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 uppercase"
            >
              View Bundle Contents <ChevronDown size={14} />
            </motion.a>
          </motion.div>

          {/* Secure Trust Markers */}
          <motion.div variants={animItem} className="flex flex-wrap gap-4 pt-1 text-[11px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-violet-400" /> One-time Payment
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock size={12} className="text-[#10b981]" /> Instant Access
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award size={12} className="text-violet-400" /> royalty-free Extended License
            </span>
          </motion.div>
        </motion.div>

        {/* Right Product Mockup Card Grid representation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative mt-8 lg:mt-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-orange-500/5 blur-[80px] rounded-3xl" />
          <div className="relative rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-6 md:p-8 shadow-2xl">
            {/* Live activity indicator badge */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase shadow-md flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              85% LIMITED INSTAGRAM OFFER
            </div>

            <div className="space-y-4">
              {/* Main premium visual box representation */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden relative group transition-all"
              >
                <div className="h-48 md:h-56 bg-[#050505] flex flex-col justify-center items-center p-6 relative">
                  
                  {/* Floating abstract particles using pure CSS gradients */}
                  <div className="absolute top-4 left-6 h-1 w-12 rounded bg-violet-400/40" />
                  <div className="absolute bottom-6 right-8 h-8 w-8 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] text-violet-400 font-mono">LUT</div>
                  <div className="absolute bottom-12 left-8 h-6 w-16 rounded border border-zinc-805 flex items-center justify-center text-[8px] text-zinc-500 font-mono uppercase tracking-wider">PRESET CORE</div>

                  <div className="text-center space-y-2 z-10">
                    <span className="rounded-full bg-violet-950/60 text-violet-400 text-[10px] font-mono px-3 py-0.5 tracking-wider uppercase font-bold">
                      DOWNLOAD DIRECTORY
                    </span>
                    <h3 className="text-2xl font-bold font-display text-white tracking-tight uppercase leading-none">
                      MEGA BUNDLE
                    </h3>
                    <p className="text-zinc-500 text-[10px] tracking-wide uppercase font-mono">
                      PRESETS • SOUND EFFECTS • LUTS • TEMPLATES
                    </p>
                  </div>

                  {/* Virtual visual asset cards floating in container */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 shadow-2xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-xs text-white">
                        6K
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-200 block leading-tight">Master pack.zip</span>
                        <span className="text-[8px] font-mono text-zinc-500">6.42 GB • Fully Verified</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-violet-400 font-bold bg-violet-950/40 px-2 py-0.5 rounded">
                      READY
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Check highlights list */}
              <div className="space-y-2.5 pt-4">
                {[
                  { title: '1,500+ Premium Transitions', sub: 'Camera pans, zooms, light leak glides' },
                  { title: '450+ Blockbuster LUTs', sub: 'Color grades mapped for flat Log feeds' },
                  { title: '1,200+ Cine Impact Sound FX', sub: '96kHz WAV files, risers, ambient swooshes' },
                  { title: '600+ Animated Titles & Icons', sub: 'Fully editable typography template overlays' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-left">
                    <div className="h-5 w-5 shrink-0 rounded-full bg-violet-950/60 text-violet-400 flex items-center justify-center mt-0.5 border border-violet-800/10">
                      <Check size={11} className="stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Urgency Highlight badge */}
              <div className="rounded-xl bg-violet-950/10 border border-violet-900/15 p-4 mt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-bold text-zinc-400">TOTAL BUNDLE WORTH:</span>
                  <span className="text-xs text-zinc-500 line-through font-mono">$199.00</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-violet-400 tracking-wider">YOUR EXCLUSIVE DEAL:</span>
                  <span className="text-2xl font-black text-white font-mono">$9.00</span>
                </div>
                <p className="text-[9px] text-zinc-500 text-right mt-1 font-mono">Instant download • Includes Lifetime Updates</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.025, filter: 'brightness(1.08)' }}
                whileTap={{ scale: 0.975 }}
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:brightness-110 tracking-widest py-3.5 font-bold uppercase text-xs text-white transition-all shadow-md shadow-violet-600/15 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} /> SECURE PURCHASE • $9
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* COMPATIBILITY STRIP */}
      <section className="border-y border-white/5 bg-[#0a0b0e] py-10 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase mb-6"
          >
            UNIVERSALLY COMPATIBLE WITH EVERY MAJOR EDITING TOOL
          </motion.p>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={animContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {softwares.map((sw, i) => (
              <motion.div 
                key={i} 
                variants={animItem}
                whileHover={{ y: -3, scale: 1.03 }}
                className="rounded-xl bg-white/2 border border-[#ffffff0a] p-3 flex flex-col justify-center items-center text-center hover:bg-white/5 hover:border-white/10 transition-all group cursor-default"
              >
                <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors uppercase tracking-wider font-display">
                  {sw.name}
                </span>
                <span className="text-[8px] font-mono text-slate-600 uppercase mt-1 tracking-widest">
                  {sw.badge}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: WHAT'S INCLUDED */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        id="whats-included" 
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28"
      >
        <div className="text-center space-y-3 mb-16">
          <span className="rounded-full bg-violet-950/20 border border-violet-800/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-black">
            INSIDE THE VAULT
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            What Is Included in the Mega Bundle?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto">
            Everything is carefully indexed, labeled, and prepared for seamless drag-and-drop workflow adjustments inside any editing software.
          </p>
        </div>

        {/* Dynamic Grid Layout of Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCLUDED_ASSETS.map((asset) => (
            <motion.div 
              key={asset.id}
              whileHover={{ 
                y: -6, 
                scale: 1.02, 
                borderColor: '#2d2d30',
                boxShadow: '0 20px 30px -10px rgba(124, 58, 237, 0.12), 0 10px 20px -10px rgba(0, 0, 0, 0.5)' 
              }}
              className="relative rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-6 md:p-8 flex flex-col justify-between hover:bg-[#101012] transition-all group overflow-hidden"
            >
              {/* Highlight subtle corner decor elements */}
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-3xl pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900/50 flex items-center justify-center text-violet-400 border border-zinc-800 group-hover:bg-violet-950/20 group-hover:border-violet-400/25 transition-all">
                    <IconRenderer name={asset.iconName} className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xl font-black text-white group-hover:text-violet-400 transition-colors">
                      {asset.count}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                      ASSETS
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-zinc-100 font-display">
                      {asset.title}
                    </h3>
                    {asset.badge && (
                      <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-mono text-violet-300 uppercase tracking-wider font-bold">
                        {asset.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              </div>

              {/* Asset Feature bullets */}
              <div className="border-t border-zinc-900 pt-4 mt-auto">
                <ul className="space-y-1.5">
                  {asset.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}

          {/* Placeholder cards for additional resources as requested */}
          <motion.div 
            whileHover={{ 
              y: -5, 
              scale: 1.015,
              borderColor: '#2d2d30', 
              boxShadow: '0 15px 25px -10px rgba(0, 0, 0, 0.4)'
            }}
            className="relative rounded-2xl border border-dashed border-zinc-800 bg-[#0c0c0e]/50 p-6 md:p-8 flex flex-col justify-center items-center text-center p-8 group transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-zinc-900/40 flex items-center justify-center text-zinc-500 border border-dashed border-zinc-800 mb-4 group-hover:border-violet-500/20 group-hover:text-violet-400 transition-all">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <h3 className="font-bold text-sm text-zinc-300 font-display uppercase tracking-wider">
              Weekly Resource Drops
            </h3>
            <p className="text-[11px] text-zinc-500 mt-2 max-w-xs leading-relaxed">
              We periodically drop bonus presets, sound bites, and TikTok formats directly in the shared drive cabinet for existing VIP members — at absolutely zero extra cost.
            </p>
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[8px] font-mono text-zinc-400 mt-4 uppercase">
              RESERVED FOR BUYERS
            </span>
          </motion.div>
        </div>

        {/* Centralised BUY trigger section 1 */}
        <div className="mt-14 text-center">
          <motion.button
            whileHover={{ scale: 1.03, filter: 'brightness(1.05)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCheckoutOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-zinc-100 px-8 py-4.5 text-xs font-bold uppercase text-black tracking-widest transition-all shadow-xl shadow-white/5 active:scale-[0.98] cursor-pointer"
          >
            <Lock size={12} className="stroke-[3]" /> SECURE ACCESS TO ALL 6,000+ ASSETS NOW
          </motion.button>
          <p className="text-[10px] text-zinc-500 mt-2.5">Instant delivery to your email after buy instructions • Safe checkout</p>
        </div>
      </motion.section>

      {/* SECTION 2: WHY EDITORS LOVE THIS BUNDLE */}
      <section className="relative z-10 border-y border-zinc-900 bg-[#050505] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left promo copy box */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-6"
            >
              <span className="rounded-full bg-violet-955/25 border border-violet-850/30 px-3 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-black">
                EFFICIENCY & RESULTS
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight text-white">
                Why Professional Editors Love This Asset Bundle Pack
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                As a creator or freelancer, your income is directly tied to your output. If you are starting every video edit project with empty timelines and spent hours digging for standard sound effects or mapping basic transitions, you are limiting your hourly potential.
              </p>
              <div className="p-4 rounded-xl bg-[#0c0c0e] border border-zinc-850 max-w-md">
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-mono text-2xl font-black block">10x Output</span>
                <p className="text-xs text-zinc-400 mt-1">Our average user reports completing client video versions in under half the historical time, with immediate customer sign-off rates due to higher visual finish.</p>
              </div>
            </motion.div>

            {/* Right side list grid points */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
              variants={animContainer}
              className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {LOVE_REASONS.map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={animItem}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.015,
                    borderColor: '#2d2d30', 
                    boxShadow: '0 15px 25px -10px rgba(0, 0, 0, 0.5)'
                  }}
                  className="rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-6 flex flex-col justify-between hover:border-zinc-750 transition-all"
                >
                  <div>
                    <div className="h-9 w-9 rounded-lg bg-violet-950/50 text-violet-400 flex items-center justify-center mb-4 border border-violet-800/20">
                      <IconRenderer name={item.iconName} className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-150 font-display tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest font-bold">
                      {item.metric}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 3: BUNDLE PREVIEW (BEFORE & AFTER INTERACTIVE COMPONENT) */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28"
      >
        <div className="text-center space-y-3 mb-12">
          <span className="rounded-full bg-violet-950/20 border border-violet-800/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-black">
            VISUAL PROOF PREVIEW
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            See the Quality for Yourself
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto col">
            Interactive side-by-side comparison. Use your mouse cursor or finger to slide across and look at the difference premium color grading and film presets make.
          </p>
        </div>

        {/* Gallery selection tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PREVIEWS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreview(p)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedPreview.id === p.id
                  ? 'bg-white text-black shadow-lg shadow-white/5'
                  : 'bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
            >
              {p.tag}
            </button>
          ))}
        </div>

        {/* Interactive BeforeAfter Widget wrapper */}
        <div className="max-w-4xl mx-auto">
          <BeforeAfterSlider
            key={selectedPreview.id}
            beforeImg={selectedPreview.beforeImg}
            afterImg={selectedPreview.afterImg}
            title={selectedPreview.title}
            description={selectedPreview.description}
          />
        </div>

        {/* Cinematic Video placeholders description */}
        <div className="mt-12 text-center max-w-md mx-auto">
          <p className="text-[11px] text-zinc-500">
            *Representative 35mm film emulsions and LUT maps. Performance varies dynamically depending on camera configuration and lighting environment.
          </p>
        </div>
      </motion.section>

      {/* SECTION 4: WHO IS THIS FOR? */}
      <section className="relative z-10 border-t border-zinc-900 bg-[#050505] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3 mb-16"
          >
            <span className="rounded-full bg-violet-955/20 border border-violet-850/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-bold">
              USER COMPATIBILITY
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Who Is This Mega Bundle Pack For?
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl mx-auto">
              No matter what style of videos you prepare or what software you edit in, this bundle accelerates your outputs.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-110px" }}
            variants={animContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TARGET_SEGMENTS.map((seg) => (
              <motion.div 
                key={seg.id}
                variants={animItem}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02, 
                  borderColor: '#2d2d30',
                  boxShadow: '0 15px 25px -10px rgba(124, 58, 237, 0.08), 0 10px 15px -10px rgba(0, 0, 0, 0.5)'
                }}
                className="rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-6 hover:bg-[#101012] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-9 w-9 rounded-lg bg-violet-950/50 text-violet-400 flex items-center justify-center mb-5 border border-violet-800/20 transition-colors group-hover:bg-violet-900/30">
                    <IconRenderer name={seg.iconName} className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-bold text-sm text-zinc-150 font-display uppercase tracking-wider">
                    {seg.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                    {seg.description}
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">PRIMARY USE:</span>
                  <span className="text-[10px] text-violet-400 font-semibold">{seg.useCase}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIALS (CLEAN CARDS + RATINGS) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3 mb-16"
        >
          <span className="rounded-full bg-violet-955/20 border border-violet-850/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-bold">
            CLIENT FEEDBACK
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            What Fellow Editors Are Saying
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Read unfiltered opinions from creators, freelancers, and film directors who transformed their timing workflows.
          </p>
        </motion.div>

        {/* Grid layout of testimonials */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-110px" }}
          variants={animContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {TESTIMONIALS.map((review) => (
            <motion.div 
              key={review.id}
              whileHover={{ 
                y: -4, 
                scale: 1.015,
                borderColor: '#2d2d30',
                boxShadow: '0 15px 25px -10px rgba(0, 0, 0, 0.4)'
              }}
              className="relative rounded-2xl border border-zinc-850 bg-[#0c0c0e] p-6 md:p-8 flex flex-col justify-between hover:border-zinc-750 transition-all bg-gradient-to-tr from-[#0c0c0e] via-[#0c0c0e] to-zinc-900/10"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4 select-none">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-violet-400 text-violet-400" />
                  ))}
                  <span className="text-[10px] font-mono text-zinc-500 ml-1.5 uppercase font-black font-semibold">VERIFIED ACCESS BUYER</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "{review.text}"
                </p>
              </div>

              {/* Author profiles */}
              <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-zinc-900">
                <img
                  src={review.avatar}
                  alt={review.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-zinc-800"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-zinc-100">{review.name}</span>
                    {review.verified && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 rounded-full px-1.5 py-0.2 uppercase font-black select-none">Verified</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{review.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-black select-none">
                    {review.platform}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trusted trust rating summary */}
        <div className="mt-14 rounded-2xl bg-[#0c0c0e] border border-zinc-850 max-w-2xl mx-auto p-6 text-center">
          <p className="text-xs text-zinc-400 leading-relaxed">
            🎓 <strong>Have a question or review?</strong> We care deeply about video editors' success metrics. If you need dedicated workflow layout training notes, drop us an invite at <strong className="text-white hover:underline">support@editorsbundle.co</strong>.
          </p>
        </div>
      </section>

      {/* SECTION 6: FAQ SECTION (ACCORDION STYLE) */}
      <section className="relative z-10 border-t border-zinc-900 bg-[#050505] py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3 mb-14"
          >
            <span className="rounded-full bg-violet-955/25 border border-violet-850/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-black">
              COMMON INQUIRIES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400 text-xs">
              Clear answers to standard questions regarding our digital products.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-110px" }}
            variants={animContainer}
            className="space-y-3"
          >
            {FAQS.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <motion.div 
                  key={faq.id} 
                  variants={animItem}
                  className="rounded-xl border border-zinc-850 bg-[#0c0c0e]/60 overflow-hidden text-left transition-all hover:border-zinc-750"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-zinc-200 hover:text-white transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      size={14} 
                      className={`text-zinc-500 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-violet-400' : ''}`} 
                    />
                  </button>
                  
                  {/* Expandable answers */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1 text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-900">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: PRICING SECTION */}
      <section 
        id="pricing" 
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28"
      >
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3 mb-16"
        >
          <span className="rounded-full bg-violet-955/20 border border-violet-850/30 px-3.5 py-1 text-[9px] font-mono tracking-widest text-violet-400 uppercase font-black font-semibold">
            LIMITED TIME OFFER
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Secure Your Instant Lifetime Download
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Ditch recurring software subscriptions. Get lifetime download credentials for a single, small payment.
          </p>
        </motion.div>

        {/* Pricing Card Grid Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto relative select-none"
        >
          
          {/* Subtle outer glow effect for popular card */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-orange-500 blur-[40px] opacity-[0.08] rounded-2xl animate-pulse" />

          <motion.div 
            whileHover={{ 
              y: -5, 
              scale: 1.015,
              borderColor: '#3f3f46',
              boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.15), 0 10px 20px -10px rgba(0, 0, 0, 0.6)'
            }}
            className="relative rounded-2xl border border-zinc-805 bg-[#0c0c0e] p-6 md:p-8 shadow-2xl overflow-hidden transition-all"
          >
            {/* Corner Popular Tag */}
            <div className="absolute top-4 right-4 bg-white text-black text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-md font-semibold select-none">
              BEST SELLER
            </div>

            <div className="text-left space-y-4">
              <div>
                <h3 className="font-display font-black text-xl text-white tracking-tight">
                  {PRICING.name}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono tracking-widest">
                  {PRICING.tagline}
                </p>
              </div>

              {/* Price Block */}
              <div className="border-y border-zinc-900 py-5 flex items-baseline justify-between select-none">
                <div>
                  <span className="text-sm font-mono text-zinc-500 line-through mr-2 leading-none">
                    {PRICING.originalPrice}
                  </span>
                  <span className="font-mono text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-orange-300 bg-clip-text text-transparent leading-none">
                    {PRICING.currentPrice}
                  </span>
                </div>
                <div className="text-right">
                  <span className="rounded-lg bg-violet-955/40 border border-violet-850/20 text-[10px] font-mono text-violet-400 font-bold px-2 py-0.5 block">
                    {PRICING.savings}
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono block mt-1 uppercase">ONE-TIME FEE</span>
                </div>
              </div>

              {/* Countdown Urgency Warning in pricing block */}
              <div className="rounded-lg bg-red-950/10 border border-red-900/15 p-2.5 flex items-center justify-between text-[11px] text-rose-300 select-none">
                <span className="font-bold flex items-center gap-1">
                  <Flame size={12} className="animate-pulse text-rose-400" /> PROMO EXPIRES IN:
                </span>
                <span className="font-mono font-black text-rose-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s
                </span>
              </div>

              {/* Included features checklist */}
              <div className="space-y-2.5 pt-4">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold select-none">
                  INCLUDED REPERTOIRE CODES:
                </span>
                <div className="space-y-2.5">
                  {PRICING.features.map((feat, i) => (
                    <div key={i} className="flex gap-2.5 items-center text-xs">
                      <div className="h-4.5 w-4.5 rounded-full bg-violet-950/45 text-violet-300 flex items-center justify-center shrink-0 border border-violet-800/10">
                        <Check size={10} className="stroke-[3]" />
                      </div>
                      <span className="text-zinc-350 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Buy CTA */}
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.025, filter: 'brightness(1.05)' }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full rounded-xl bg-white hover:bg-zinc-100 tracking-widest py-4 font-bold uppercase text-xs text-black transition-all shadow-lg shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock size={13} className="stroke-[2.5]" /> SECURE ACCESS NOW • $9
                </motion.button>
              </div>

              {/* Payment Trust badging indicators */}
              <div className="pt-2 select-none">
                <p className="text-center text-[9px] text-zinc-650 font-mono tracking-widest uppercase mb-3 text-zinc-500">
                  SECURED WORLDWIDE DEPLOYMENTS BY
                </p>
                <div className="flex justify-center items-center gap-4 text-[10px] text-zinc-500 font-semibold select-none opacity-80">
                  <span>PayPal Verified</span>
                  <span>•</span>
                  <span>UPI Quick Pay</span>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 8: FINAL CALL TO ACTION */}
      <section className="relative z-10 border-t border-zinc-900 bg-[#050505] py-20 md:py-24 overflow-hidden">
        
        {/* Abstract back-lit lights behind final CTA block */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-violet-955/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-4 text-center space-y-6 relative"
        >
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-955/20 text-violet-400 border border-violet-850/25">
            <Sparkles size={16} className="animate-pulse" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Level Up Your Edits Today.
          </h2>
          
          <p className="text-zinc-450 text-sm md:text-base max-w-xl mx-auto leading-relaxed text-zinc-400">
            Join 14,200+ content creators, YouTubers, and commercial studios who have ditched repetitive keyframing and standard flat visuals. Fast track your workflow instantly.
          </p>

          <div className="flex flex-col items-center justify-center gap-2 pt-4">
            <motion.button
              whileHover={{ scale: 1.025, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.975 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:brightness-110 px-8 py-4 text-xs font-bold uppercase text-white tracking-widest transition-all shadow-xl shadow-violet-600/15 active:scale-[0.98] cursor-pointer"
            >
              SECURE DOWNLOAD • GET $190 DISCOUNT TODAY
            </motion.button>
            <span className="text-[10px] font-mono text-rose-455 font-bold uppercase tracking-widest mt-1">
              ⏳ Scarcity Lock: Only 14 licenses remaining at this offer price
            </span>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-900 bg-[#050505] py-12 px-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Logo & copyright info */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Play size={10} className="text-white fill-white stroke-[3]" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-white uppercase">
                EDITORS<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-black">MEGA</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              © 2026 EditorsMega Inc. All trademarks are property of their respective owners. Pro and Extended License valid globally. Fully royalty-free.
            </p>
          </div>

          {/* Quick legal anchors and contact support email */}
          <div className="flex flex-col items-center md:items-end gap-3 font-mono text-[10px] tracking-widest text-zinc-500">
            <div className="flex flex-wrap justify-center gap-4 text-zinc-400">
              <button 
                onClick={() => {
                  setActivePolicyTab('privacy');
                  setIsPolicyOpen(true);
                }}
                className="hover:text-violet-400 transition-colors uppercase cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                Privacy Policy
              </button>
              <span>|</span>
              <button 
                onClick={() => {
                  setActivePolicyTab('terms');
                  setIsPolicyOpen(true);
                }}
                className="hover:text-violet-400 transition-colors uppercase cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                Terms & Conditions
              </button>
              <span>|</span>
              <button 
                onClick={() => {
                  setActivePolicyTab('refund');
                  setIsPolicyOpen(true);
                }}
                className="hover:text-violet-400 transition-colors uppercase cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                Refund Policy
              </button>
              <span>|</span>
              <button 
                onClick={() => {
                  setActivePolicyTab('contact');
                  setIsPolicyOpen(true);
                }}
                className="hover:text-violet-400 transition-colors uppercase cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 outline-none"
              >
                <Mail size={10} /> CONTACT US
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* GLOBAL DYNAMIC CHECKOUT POPUP DIALOG DRAWER */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        plan={PRICING} 
        onSuccess={(name, email, token) => {
          setSessionToken(token);
          setCustomerName(name);
          setCustomerEmail(email);
          setHasPurchased(true);
          setShowSuccessToast(true);
        }}
      />

      {/* COMPLIANT LEGAL POLICY OVERLAYS */}
      <AnimatePresence mode="wait">
        {isPolicyOpen && (
          <PolicyModal 
            isOpen={isPolicyOpen}
            onClose={() => setIsPolicyOpen(false)}
            initialTab={activePolicyTab}
          />
        )}
      </AnimatePresence>

      {/* FLOATING REAL-TIME CONVERSION NOTIFICATION FOR META ADS TRAFFIC SOCIAL PROOF */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-6 left-6 z-50 rounded-xl border border-zinc-850 bg-[#0c0c0e] p-4 shadow-2xl flex items-center gap-3.5 max-w-sm backdrop-blur-md"
          >
            {/* Pulsing purchase beacon */}
            <div className="h-8 w-8 rounded-full bg-violet-955/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-850/15">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-[#e4e4e7] font-bold text-xs">{activeNotification.name}</span>
                <span className="text-[10px] text-zinc-500">({activeNotification.location})</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Instantly secured lifetime licenses for <strong className="text-violet-450 text-violet-400 font-semibold">Video Editing Mega Bundle</strong>
              </p>
              <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-500 mt-1">
                <Clock size={8} /> {activeNotification.timeAgo} • Verified Secured Purchase
              </div>
            </div>
            
            {/* Miniature visual buy icon trigger */}
            <div className="pointer-events-none rounded bg-violet-955/20 px-1.5 py-0.5 text-[8px] font-bold text-violet-400 uppercase font-mono tracking-widest select-none shrink-0 ml-1">
              +$9
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

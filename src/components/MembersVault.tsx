import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Check, Copy, ExternalLink, ShieldAlert, Cpu, 
  Tv, Activity, Clock, ArrowLeft, FolderClosed, Volume2, 
  Palette, RefreshCw, Zap, Image, Video, HelpCircle, HardDrive, Sparkles
} from 'lucide-react';

interface MembersVaultProps {
  customerName: string;
  customerEmail: string;
  onBackToLanding: () => void;
  sessionToken?: string;
  showWelcomeToast?: boolean;
}

// 20 Premium Content Modules inspired directly by professional video editing packs with visual animated loops (secured server-side mapping)
const ASSET_PILLARS = [
  {
    id: 'high-definition-3d',
    title: 'Studio-Grade High-Definition 3D Geometry Pack',
    category: '3D GRAPHICS',
    size: '2.3 GB',
    count: '120+ High Quality 3D Assets',
    formats: '.PNG (Transparents) + .OBJ/.FBX Meshes',
    badge: '3D MODERN DESIGN',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781155753/3D_elements_swarm_and_assemble_202606091459_esfpkz.mp4',
    fallbackVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-bubbles-animation-background-loop-41812-large.mp4',
    description: 'Elevate your UI design, video transitions, or poster artwork with crisp, studio-graded glassy and metallic high-resolution 3D models and transparent renders.',
    contains: [
      '40+ Abstract glassy geometric objects',
      '30+ Metallic fluid shapes & dynamic toruses',
      '25+ Modern neon tech symbols',
      'Pre-lit high-fidelity OBJ/FBX files'
    ]
  },
  {
    id: 'motion-graphic-fx-pack',
    title: 'Cinematic Motion Graphics Creative FX Pack',
    category: 'MOTION DESIGN',
    size: '1.05 GB',
    count: '150+ Motion Assets',
    formats: '.AE, .MOGRT, .MP4 (ProRes)',
    badge: 'MOTION GRAPHICS',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781156281/Creative_FX_motion_design_reel_202606091522_oxrhen.mp4',
    description: 'Supercharge your timeline with stunning, custom-designed premium motion templates. Includes modern transition elements, dynamic shapes, and lower-third typography cards.',
    contains: [
      '50+ Fluid Vector shape transitions',
      '40+ Typography Presets & Title templates',
      '35+ Animated Social Media Popups & Lower Thirds',
      'Fully customizable layers for premium drag-and-drop ease'
    ]
  },
  {
    id: 'mavic-luts',
    title: 'Cinematic Mavic 2 Pro Color-Grading LUTs',
    category: 'COLOR GRADING',
    size: '198 MB',
    count: '200+ Cinematic LUT Templates',
    formats: '.CUBE (D-Log, Rec709)',
    badge: 'DRONE EXCLUSIVE',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781156665/LUT_transformations_showcase_slider_202606091531_dvziqw.mp4',
    description: 'Formulated exclusively for Mavic drone footage. Restore rich cinematic contrast, organic forest greens, and vibrant sunset skies in one click.',
    contains: [
      '5 D-Log Rec709 Precision Converters',
      '3 Nordic Chill Desaturated Presets',
      '4 Vivid Island Coastal Profiles',
      'Fully customizable keyframe exposure weights'
    ]
  },
  {
    id: 'free-sound-fx',
    title: 'Pristine Cinema Foley & Sound FX Library',
    category: 'AUDIO ENVIRONMENT',
    size: '2.02 GB',
    count: '80+ Lossless WAV Files',
    formats: '.WAV (24-Bit / 48kHz)',
    badge: 'CINE FOLEY',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157249/Audio_visualizations_showcase_mo__202606091539_hmhqdz.mp4',
    description: 'Establish ultimate spatial immersion. Deep room rumbles, cinematic sub drops, realistic sweeping risers, and metallic hits built to captivate audiences.',
    contains: [
      '20 Low-Frequency Sub Drops',
      '15 Whoosh Motion Accents',
      '25 Environmental Foley Textures',
      'Royalty-free licensing key certificate'
    ]
  },
  {
    id: 'paper-rip-fx',
    title: 'Brutalist Stop-Motion Paper Rip FX Pack',
    category: 'TRANSITIONS & BRUTALISM',
    size: '0.9 GB',
    count: '120+ Animated Frame Assets',
    formats: '.MOV (With Alpha Embedded)',
    badge: 'STOP MOTION',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157257/Paper_rip_torn_paper_effects_202606091545_h0i9is.mp4',
    description: 'AESTHETIC & RAW. Real stop-motion paper rips, tearing borders, and texture animations. Hand-scanned and compiled overlay sequences.',
    contains: [
      '15 Paper Tear Transitions (Alpha)',
      '30 Grunge Collage Border Maps',
      '12 Slow Cardboard Scan Loops',
      'Drag and drop installation layout tutorials'
    ]
  },
  {
    id: 'smoke-fx',
    title: 'VFX Atmospheric Smoke & Ink Vapor Pack',
    category: 'VFX ELEMENT',
    size: '2.35 GB',
    count: '45+ Slow-Mo Sequences',
    formats: '.MP4 ProRes 422 Quicktime',
    badge: 'VFX HOLLYWOOD',
    badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157263/Smoke_effects_showcase_black_bac__202606091554_qikzum.mp4',
    description: 'Add physical depth with black-backed realistic smoke, billowing fog loops, ink drop elements, and rising cloud flares for dynamic timelines.',
    contains: [
      '12 Vapor Billow Overlay Claps',
      '8 Rapid Steam Discharge Loops',
      '15 Organic Ink Droplet Scans',
      'Custom pre-keyed wind vortex sweeps'
    ]
  },
  {
    id: 'title-card-fx',
    title: 'Retro Cinema Title Card Typography Suite',
    category: 'TEXT & GRAPHICS',
    size: '1.85 GB',
    count: '60+ Responsive Vectors',
    formats: '.MOGRT, .AE Project, .PSD',
    badge: 'RETRO CINEMA',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157262/Title_Card_Typography_Suite_Show__202606091605_ekddpe.mp4',
    description: 'Captivate your viewers instantly. High-impact opening credit template layouts, retro grunge cards, and clean typography configurations.',
    contains: [
      '10 Film Title Intro Configurations',
      '15 Cyberpunk Typo HUD Layouts',
      'Fully editable vector sizing layers',
      'All commercial workspace fonts included'
    ]
  },
  {
    id: 'free-2dfx',
    title: 'Cel-Animated 2D FX All-Elements Studio Pack',
    category: 'CEL ANIMATIONS',
    size: '1.56 GB',
    count: '90+ Animated Energy Loops',
    formats: '.MOV (ProRes 4444 Transparent)',
    badge: 'FLASH & ANIME',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157236/2D_motion_graphics_showcase_202606091610_hltjgw.mp4',
    description: 'Dynamic hand-drawn flash effects! Flame embers, energy bolts, liquid shockwaves, and comic style visual pops with built-in alpha.',
    contains: [
      '25 Hyper-Speed Lightning Bolts',
      '15 Cartoon Exploding Shockwaves',
      '20 Cyber Plasma Spark Sweeps',
      'Vector project file assets (.AI)'
    ]
  },
  {
    id: 'holiday-fx',
    title: 'Cinematic Holiday Festive FX Pack',
    category: 'SEASONAL VISUALS',
    size: '920 MB',
    count: '40+ Sparkling Overlay Nodes',
    formats: '.PNG Transparent, .MOV ProRes',
    badge: 'LIMITED CAMPAIGN',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1513553404607-988bf2703777?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157250/Golden_bokeh_festive_overlays_202606091613_yxhftj.mp4',
    description: 'Add premium festive warmth and luxury looks. Features golden sparkling dust emitters, slow drifting snow presets, and high-end bokeh overlays.',
    contains: [
      '8 Organic Realistic Snow Storm Loops',
      '12 Golden Sparkle Bokeh Emitters',
      '15 Festive Typography Header Templates',
      'Pre-keyed Christmas particle swirls'
    ]
  },
  {
    id: 'scribble-fx',
    title: 'Vibrant Hand-Drawn Scribble FX Suite',
    category: 'NEON DOODLES',
    size: '1.1 GB',
    count: '150+ Hand-Drawn Elements',
    formats: '.MOV (With Pre-Keyed Alpha)',
    badge: 'HIP-HOP NEON',
    badgeColor: 'bg-lime-500/10 text-lime-400 border-lime-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157253/Hand-drawn_scribble_effects_show__202606091617_jxgfur.mp4',
    description: 'Bring absolute viral energy to street edits and music videos! Colorful neon scribbled pointers, arrows, crowns, and comic motion trails.',
    contains: [
      '30 Animated Glow Arrow Accents',
      '15 Comic Accent Crowns & Sparks',
      '25 Hyper-active Paint Stroke Outlines',
      'Pre-rendered 24fps hand drawn scan layers'
    ]
  },
  {
    id: 'ae-plugins',
    title: '100+ Professional After Effects VFX Plugins Bundle',
    category: 'VFX & AUTOMATION',
    size: '1.4 GB',
    count: '100+ Render Assets & Scripts',
    formats: '.JSXBIN, .FFX, .AEP Projects',
    badge: 'AUTOMATION FX',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157245/After_Effects_VFX_plugins_showcase_202606091623_xpyxtl.mp4',
    description: 'A comprehensive collection of 100+ custom pre-compiled VFX modules, kinetic typography generators, automatic tracker controllers, and interactive expression presets.',
    contains: [
      '30+ Custom Particle & Lens Flare Rigs',
      '25+ Intelligent Camera Shaker Presets',
      '20+ Expression-based Kinetic Text Rigs',
      'Detailed video guidelines & XML config notes'
    ]
  },
  {
    id: 'background-music',
    title: 'Elite Royalty-Free Cinematic Background Tracks',
    category: 'AUDIO & MUSIC',
    size: '2.8 GB',
    count: '150+ Audio Tracks',
    formats: '.WAV, .MP3 (High Quality)',
    badge: 'ROYALTY-FREE',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1539628399243-73401140326b?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157254/Music_visualization_showcase_luxury_202606091627_tvnuf3.mp4',
    description: 'An elite, handpicked compilation of 150+ royalty-free background music tracks spanning corporate, cinematic, upbeat, lo-fi, and chill acoustic genres.',
    contains: [
      '35+ Slow-Paced Cinematic Soundscapes',
      '40+ Modern Upbeat Tech & Vlog Beats',
      '45+ Lo-Fi Chill Hop Background Tracks',
      '30+ Corporate & Inspiring Acoustic Melodies'
    ]
  },
  {
    id: 'background-video-animation',
    title: 'Ultra-HD Cinematic Motion Background Loops',
    category: 'MOTION GRAPHICS',
    size: '4.2 GB',
    count: '120+ High Quality Loops',
    formats: '.MP4, .MOV (Apple ProRes)',
    badge: '4K & 1080P LOOPS',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157254/Motion_background_loops_showcase_202606091637_rmvxph.mp4',
    description: 'An expansive collection of 120+ seamlessly looping aesthetic background renders, synthwave neon grids, drifting cosmic nebulae, and minimalist geometric motion paths.',
    contains: [
      '40+ Synthwave & Retro Grid Backdrops',
      '30+ Cosmic Space Dust & Nebula Loops',
      '30+ Minimalist Flat Geometric Animations',
      '20+ Dynamic Tech Hud & Data Visualizer Loops'
    ]
  },
  {
    id: 'dust-snow-overlay',
    title: 'Cinematic Dust & Snow Atmospheric Overlays',
    category: 'VFX OVERLAYS',
    size: '1.4 GB',
    count: '120+ Atmospheric Overlays',
    formats: '.MP4, .MOV (Apple ProRes)',
    badge: 'CINEMATIC PARTICLES',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157244/Dust_and_snow_VFX_showcase_202606091640_quq7br.mp4',
    description: 'An elite, high-definition overlay system designed to add atmosphere, depth, and organic magic to your scenes. Bring flat footage to life with slow drifting snow and captured lens dust particles.',
    contains: [
      '45+ Real Captured Dust & Organic Ember Loops',
      '40+ Slow Drifting Cinematic Snow Overlays',
      '35+ High-Velocity Blizzards & Heavy Snow Storms',
      'Pre-keyed alpha layers for instant drop screen blending'
    ]
  },
  {
    id: 'premiere-pro-transition',
    title: 'Ultimate Premiere Pro Transitions Kit',
    category: 'TRANSITIONS',
    size: '13.43 GB',
    count: '350+ Transition Templates',
    formats: '.PRPROJ, .MOGRT (Premiere Pro CC)',
    badge: 'PREMIERE PRO',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157265/Professional_seamless_transition__202606091736_nzsmpy.mp4',
    description: 'Stunning premium dynamic transitions. Fully integrated with Premiere Pro for drag-and-drop zoom, pan, lens flare, and glitch effects.',
    contains: [
      '120+ Zoom & Pan motion transitions',
      '80+ Glass & Light leakage sweeps',
      '90+ Fast Glitch & Cyber distortion triggers',
      'Built-in sound design transitions matching exactly'
    ]
  },
  {
    id: 'premiere-pro-effects-preset',
    title: 'Creative Premiere Pro FX Presets Bundle',
    category: 'EFFECTS PRESETS',
    size: '0.9 GB',
    count: '400+ Premiere Presets',
    formats: '.PRFPSET (Effects System)',
    badge: 'VFX SYSTEM',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157262/Premiere_Pro_presets_showcase_202606091652_erfltj.mp4',
    description: 'Supercharge your VFX pipeline without slow render times. Includes premium VHS glitch filters, filmic shakes, split-screen rigs, and lens distortions.',
    contains: [
      '150+ Keyframe camera shakes',
      '100+ Film textures & retro VHS preset rigs',
      '80+ Split screen & custom grid formats',
      'Drag and drop direct effects panel integrations'
    ]
  },
  {
    id: 'fire-sparks-sfx',
    title: 'Cinematic Fire & Sparks Video Overlays',
    category: 'VFX ELEMENTS',
    size: '4.21 GB',
    count: '120+ Overlays & Elements',
    formats: '.MOV (ProRes), .MP4 (H.264 HD Ready for Blending)',
    badge: 'FIRE & PARTICLES',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1524143980104-3653196d43e0?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157246/Fire_and_spark_effects_showcase_202606091725_ki8urp.mp4',
    description: 'Stunning organic fire explosions, rising ember loops, slow-motion spark bursts, and blazing flame sweeps. Built specifically for video editors and VFX artists to drape instantly on any timeline.',
    contains: [
      '40+ High-velocity explosive spark blasts',
      '30+ Atmospheric slow-drifting ember & ash loops',
      '50+ Organic flame sweeps, trails, and torch accents',
      'Optimized black backgrounds for instant Screen & Add blending modes'
    ]
  },
  {
    id: 'seamless-motion-transitions',
    title: 'Ultimate Seamless Transitions Pack',
    category: 'TRANSITIONS',
    size: '1 GB',
    count: '150+ Dynamic Cuts',
    formats: '.MOV (ProRes Media) + .MOGRT Presets',
    badge: 'CINEMATIC FLOW',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157266/Professional_video_transitions_s__202606091648_ayfjgy.mp4',
    description: 'Transform your story rhythm with professional, drag-and-drop transitions. Includes whip pans, hyper zooms, light sweeps, and glitch-cuts with sound design.',
    contains: [
      '60+ Drag-and-drop pan & whip motion cuts',
      '40+ Organic glass refracts & leak transitions',
      '30+ Digital fast-glitch & chromatic shakes',
      'Pre-mastered clean transition audio cues (.WAV)'
    ]
  },
  {
    id: 'chroma-key-green-screen',
    title: 'Ultimate Chroma Key Green Screen Pack',
    category: 'VFX ELEMENTS',
    size: '2.1 GB',
    count: '120+ Keyed Studio Assets',
    formats: '.MP4 (High-Bitrate Chroma-Backed ProRes)',
    badge: 'CHROMA KEY',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157245/Green_screen_creator_assets_show__202606091738_geaxab.mp4',
    description: 'Perfectly balanced studio-shot chroma key assets. High-contrast smoke clouds, flame bursts, realistic lighting flashes, and cyber hologram particles ready for layering.',
    contains: [
      '45+ Cinema explosion & slow-mo fire plates',
      '35+ Heavy atmosphere, rain, and sparks overlays',
      '20+ Sci-Fi HUD overlays & hologram layers',
      'Flawless green backing for rapid chroma key extraction'
    ]
  },
  {
    id: 'cyberpunk-grid-overlays',
    title: 'Minimalist Cinematic Grids & HUD Overlays',
    category: 'LAYOUT & GRIDS',
    size: '0.85 GB',
    count: '110+ Tech Grids & Overlays',
    formats: '.PNG Transparents, .MOGRT (Motion Layouts)',
    badge: 'DESIGN GRIDS',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    gifUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://res.cloudinary.com/dvrohefqt/video/upload/q_auto/f_auto/v1781157240/Animated_motion_grids_showcase_202606091745_w82dt0.mp4',
    description: 'An intensive grid layout & align overlays library. Perfect for high-tech HUD designs, futuristic corporate videos, structured documentary title styling, and kinetic blueprint backgrounds.',
    contains: [
      '45+ Sci-Fi & Cyberpunk modular grid loops',
      '30+ Minimalist camera viewfinder framing overlays',
      '25+ Kinetic blueprint vector backgrounds',
      'Pre-packaged direct timeline layering guides'
    ]
  }
];

export default function MembersVault({ customerName, customerEmail, onBackToLanding, sessionToken, showWelcomeToast }: MembersVaultProps) {
  const [copied, setCopied] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: 'idle' | 'downloading' | 'completed' }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'color' | 'audio' | 'motion' | 'graphics'>('all');
  const [serverStatus, setServerStatus] = useState({ ping: 24, load: 'Low', speed: '942 Mbps' });
  const [alertVisible, setAlertVisible] = useState(true);
  const [successToast, setSuccessToast] = useState<{ name: string; location: string; timeAgo: string } | null>(null);

  // License Signature code
  const licenseKey = "VEMB-2026-X779A-VIP95";

  // Simulate network speed and latency fluctuations
  useEffect(() => {
    const handleInterval = setInterval(() => {
      setServerStatus({
        ping: Math.floor(Math.random() * 8) + 21,
        load: Math.random() > 0.8 ? 'Medium' : 'Low',
        speed: (930 + Math.floor(Math.random() * 30)) + ' Mbps'
      });
    }, 4000);
    return () => clearInterval(handleInterval);
  }, []);

  // Set active welcome toast if they just made a purchase
  useEffect(() => {
    if (showWelcomeToast) {
      let displayName = customerName || 'Creative Editor';
      if (displayName.includes('@')) {
        displayName = displayName.split('@')[0];
      }
      
      setSuccessToast({
        name: displayName,
        location: customerEmail ? 'Verified Customer' : 'Instant Activation',
        timeAgo: 'Just Now'
      });
      
      const timer = setTimeout(() => {
        setSuccessToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeToast, customerName, customerEmail]);

  const copyLicense = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownloadSim = async (id: string) => {
    const tokenToUse = sessionToken || localStorage.getItem('vemb_token');
    if (!tokenToUse) {
      alert("Verification session expired. Please verify your license key again.");
      return;
    }
    
    setDownloadProgress(prev => ({ ...prev, [id]: 'downloading' }));
    try {
      const res = await fetch('/api/get-download-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToUse, assetId: id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setDownloadProgress(prev => ({ ...prev, [id]: 'completed' }));
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        setDownloadProgress(prev => ({ ...prev, [id]: 'idle' }));
        alert(data.error || "Unable to authorize download for this module.");
      }
    } catch (e) {
      setDownloadProgress(prev => ({ ...prev, [id]: 'idle' }));
      console.error(e);
      alert("A network timeout occurred validating secure download keys.");
    }
  };

  // Filter content
  const filteredAssets = ASSET_PILLARS.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'color' && (asset.id === 'mavic-luts' || asset.id === 'premiere-pro-effects-preset')) return true;
    if (activeTab === 'audio' && (asset.id === 'free-sound-fx' || asset.id === 'background-music' || asset.id === 'fire-sparks-sfx')) return true;
    if (activeTab === 'motion' && (asset.id === 'paper-rip-fx' || asset.id === 'free-2dfx' || asset.id === 'scribble-fx' || asset.id === 'background-video-animation' || asset.id === 'dust-snow-overlay' || asset.id === 'motion-graphic-fx-pack' || asset.id === 'premiere-pro-transition' || asset.id === 'seamless-motion-transitions' || asset.id === 'chroma-key-green-screen' || asset.id === 'cyberpunk-grid-overlays')) return true;
    if (activeTab === 'graphics' && (asset.id === 'smoke-fx' || asset.id === 'title-card-fx' || asset.id === 'holiday-fx' || asset.id === 'ae-plugins' || asset.id === 'dust-snow-overlay' || asset.id === 'motion-graphic-fx-pack' || asset.id === 'premiere-pro-effects-preset' || asset.id === 'high-definition-3d' || asset.id === 'chroma-key-green-screen' || asset.id === 'cyberpunk-grid-overlays')) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 selection:bg-violet-600 selection:text-white pb-20">
      {/* Dynamic Header Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-violet-600/10 via-fuchsia-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        
        {/* Top Control Bar */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <button
            onClick={onBackToLanding}
            className="group flex items-center gap-2 rounded-xl bg-zinc-900/50 border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            RETURN TO LANDING PAGE
          </button>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Activity size={12} className="text-emerald-500 animate-pulse" /> Ping: <strong className="text-zinc-300 font-medium">{serverStatus.ping} ms</strong>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Cpu size={12} className="text-violet-400" /> Node Load: <strong className="text-zinc-300 font-medium">{serverStatus.load}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <HardDrive size={12} className="text-orange-400" /> Link Server: <strong className="text-zinc-300 font-medium">{serverStatus.speed}</strong>
            </span>
          </div>
        </div>

        {/* Success Congratulations Announcement Banner */}
        {alertVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-6 backdrop-blur-sm relative"
          >
            <div className="absolute top-4 right-4 text-[10px] text-emerald-500/70 uppercase tracking-widest font-mono cursor-pointer hover:text-emerald-400" onClick={() => setAlertVisible(false)}>
              [Dismiss]
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400 shrink-0 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <Check size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                      Payment Approved & Secured
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 font-semibold">TOKEN ID: PKG-F442Z-95</span>
                  </div>
                  <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Order Authenticated! Download Vault Unlocked</h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Congratulations <strong className="text-white">{customerName || 'Explorer'}</strong>! A master receipt email has been prepared for <strong className="text-violet-400 font-mono font-medium">{customerEmail || 'your-email@direct.com'}</strong>. Skip any waiting queues—the secure servers have fully mounted your asset archives below.
                  </p>
                </div>
              </div>

              {/* Secure Download Pack Wrapper Button */}
              <a 
                href="https://drive.google.com/file/d/1sIJ5rWp0Gv-oSZGCnGwJ2N_EKtgUT0I2/view?usp=drive_link" 
                target="_blank" 
                rel="noreferrer"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-115 px-6 py-3.5 text-xs font-bold text-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.98] shrink-0 text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                <FolderClosed size={15} /> DOWNLOAD MASTER BUNDLE ALL-IN-ONE (56 GB)
                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        )}

        {/* License Signature Section */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 backdrop-blur-sm">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 uppercase block mb-1">
                REGISTRATION LICENSE CODE
              </span>
              <h3 className="text-sm font-bold text-white mb-1">Official Studio Commercial Rights Key</h3>
              <p className="text-xs text-zinc-400">
                Guarantees perpetual royalty-free permission to utilize these visual and audio templates in client productions and monetize youtube videos without copyright flag risks.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-2.5 w-full md:w-auto shrink-0">
              <span className="font-mono text-xs font-bold text-zinc-200 tracking-wider px-3 select-all">
                {licenseKey}
              </span>
              <button
                onClick={copyLicense}
                className="className rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Copy License Key"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-850 bg-zinc-950/40 p-6 flex flex-col justify-between backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <HelpCircle size={15} />
              </span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">PREMIUM PRIORITY HELP DESK</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Need custom XML configurations or specific timeline mapping? Our engineering nodes monitor ticket requests 24/7.
            </p>
            <a 
              href="mailto:support@editorsmega.com"
              className="text-center rounded-xl bg-zinc-900 border border-zinc-800 py-2 text-[11px] font-bold text-zinc-100 hover:bg-zinc-850 transition-colors block cursor-pointer"
            >
              OPEN AN EXPERT TICKET
            </a>
          </div>
        </div>


        {/* Filter Navigation Tabs */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 bg-zinc-950/65 p-1 rounded-xl border border-zinc-900">
            {[
              { id: 'all', label: 'All Premium Vaults' },
              { id: 'color', label: 'Presets & LUTs' },
              { id: 'motion', label: 'Seamless Transitions' },
              { id: 'graphics', label: 'Graphics, Titles & 3D' },
              { id: 'audio', label: 'Sound Libraries' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-[11px] font-mono text-zinc-500">
            SHOWING <strong className="text-zinc-300 font-semibold">{filteredAssets.length}</strong> OF <strong className="text-zinc-300 font-semibold">{ASSET_PILLARS.length}</strong> MEGA MODULES
          </p>
        </div>


        {/* Master Asset Grid - Responsive layout featuring high-end animated cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAssets.map((asset) => {
            const hasDownloaded = downloadProgress[asset.id] === 'completed';
            const isDownloading = downloadProgress[asset.id] === 'downloading';

            // Retrieve the direct video link defined in the asset pillar
            const resolvedVideoUrl = asset.videoUrl;

            return (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="group relative flex flex-col rounded-2xl border border-zinc-850/80 bg-neutral-950/60 overflow-hidden hover:border-violet-500/55 transition-all duration-350 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.22)]"
              >
                {/* Visual Accent Glow Top-Bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                {/* 1. ANIMATED PREVIEW AND GIF CONTAINER - PROFESSIONAL WORKSPACE FOCUS */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950/90 border-b border-zinc-900/50 select-none bg-black">
                  
                  {/* Subtle Loading Animation inside Preview Frame */}
                  <div className="absolute inset-0 bg-neutral-900/30 animate-pulse pointer-events-none" />

                  {/* Looping Content Visual video player with fallback */}
                  {resolvedVideoUrl ? (
                    <video
                      key={resolvedVideoUrl}
                      src={resolvedVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                      preload="auto"
                      onEnded={(e) => {
                        e.currentTarget.currentTime = 0;
                        e.currentTarget.play().catch(err => console.log('Auto-play loop prevented:', err));
                      }}
                      onLoadedData={(e) => {
                        e.currentTarget.play().catch(err => console.log('Auto-play play prevented:', err));
                      }}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100 brightness-95"
                    />
                  ) : (
                    <img
                      src={asset.gifUrl}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100 brightness-95"
                    />
                  )}

                  {/* Shadow Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/40 pointer-events-none" />

                  {/* Top Overlay Badges */}
                  <div className="absolute left-3.5 top-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="rounded-md bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider text-zinc-300 uppercase">
                      {asset.category}
                    </span>

                    <span className={`rounded-md border backdrop-blur-md px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase shadow-sm ${asset.badgeColor}`}>
                      {asset.badge}
                    </span>
                  </div>

                  {/* Absolute Bottom Floating Cabinet Meta Overlay */}
                  <div className="absolute bottom-3 right-3 z-10 rounded bg-black/90 backdrop-blur-md border border-zinc-800/50 px-2.5 py-1 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5 select-none shadow-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Secure Link Live</span>
                  </div>
                </div>

                {/* 2. CARD CONTENT - TEXT DETAILS & HIGH-DENSITY FEATURES */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-zinc-950/30 backdrop-blur-xs">
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight mb-2 group-hover:text-violet-400 transition-colors flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500 group-hover:scale-150 transition-transform" />
                      {asset.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-5 min-h-[40px]">
                      {asset.description}
                    </p>

                    {/* Meta Specifications Box with glowing card highlights */}
                    <div className="rounded-xl bg-zinc-900/60 p-3.5 border border-zinc-850/60 mb-5 text-[11px] font-mono space-y-1.5 select-none hover:border-violet-500/20 transition-all">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Asset Volume:</span>
                        <span className="font-bold text-zinc-200">{asset.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Download Size:</span>
                        <span className="font-bold text-violet-400">{asset.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Container Format:</span>
                        <span className="font-bold text-zinc-300">{asset.formats}</span>
                      </div>
                    </div>

                    {/* Breakdown sub-items */}
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
                        INCLUDED IN PREMIUM ARCHIVE
                      </h4>
                      <ul className="space-y-2">
                        {asset.contains.map((item, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-xs text-zinc-400">
                            <Check size={12} className="text-violet-400 shrink-0 mt-0.5 stroke-[3]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 3. DOWNLOAD TRIGGER ELEMENT */}
                  <div className="mt-4 pt-4 border-t border-zinc-900">
                    <button
                      onClick={() => triggerDownloadSim(asset.id)}
                      disabled={isDownloading}
                      className={`w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer ${
                        hasDownloaded
                          ? 'bg-zinc-900 border border-zinc-700 text-emerald-400 hover:text-emerald-300'
                          : isDownloading
                          ? 'bg-zinc-950 border border-zinc-850 text-violet-400'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md shadow-violet-600/15 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>SYNCHRONISING ENCRYPTED PORTAL...</span>
                        </>
                      ) : hasDownloaded ? (
                        <>
                          <Check size={14} className="stroke-[2.5]" />
                          <span>PORTED SUCCESSFULLY • RE-OPEN</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                          <span>SECURE DOWNLOAD ({asset.size})</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[10px] text-center text-zinc-500 mt-2.5 font-mono">
                      Safe SSL Handshake • Lifetime Access Guarantee
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Support and Security certification badge section */}
        <div className="mt-16 rounded-2xl border border-zinc-850 bg-zinc-950/20 p-8 backdrop-blur-sm flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/25">
            <Zap size={22} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Need help importing or rendering?</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Our master compilation matches standard XML timeline structures automatically. If you encounter missing fonts, mismatching frame-rates, or proxy difficulties, read our detailed tutorial PDF instructions, or reach out to our active community support.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-zinc-300 font-mono">
              ⚡ FCPX Optimized Nodes
            </span>
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-zinc-300 font-mono">
              🎬 Premiere Master Sequences
            </span>
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-zinc-300 font-mono">
              🌌 DaVinci Color Nodes Mapping
            </span>
          </div>
        </div>

      </div>

      {/* GLOBAL FLOATING SUCCESS NOTIFICATION */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-6 left-6 z-50 rounded-xl border border-zinc-850 bg-[#0c0c0e] p-4 shadow-2xl flex items-center gap-3.5 max-w-sm backdrop-blur-md"
          >
            {/* Pulsing purchase beacon */}
            <div className="h-8 w-8 rounded-full bg-violet-955/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-850/15">
              <Sparkles size={14} className="animate-spin text-violet-400" style={{ animationDuration: '3s' }} />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-[#e4e4e7] font-bold text-xs">{successToast.name}</span>
                <span className="text-[10px] text-zinc-500">({successToast.location})</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Instantly secured lifetime licenses for <strong className="text-violet-455 text-violet-400 font-semibold font-sans">Video Editing Mega Bundle</strong>
              </p>
              <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-500 mt-1">
                <Clock size={8} /> {successToast.timeAgo} • Verified Secured Purchase
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

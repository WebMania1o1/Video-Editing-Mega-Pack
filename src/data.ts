import { IncludedAsset, LoveReason, PreviewItem, UserSegment, Testimonial, FAQItem, PricingPlan } from './types';

export const INCLUDED_ASSETS: IncludedAsset[] = [
  {
    id: 'presets',
    title: 'Cinematic Presets',
    description: '1,500+ premium drag-and-drop workflow presets designed to instantly enhance text, color, and keyframes.',
    count: '1,500+',
    category: 'Color & FX',
    badge: 'Popular',
    iconName: 'Zap',
    features: ['1-Click drag and drop', 'Premiere, DaVinci, AE supported', 'Fully customisable parameters']
  },
  {
    id: 'transitions',
    title: 'Seamless Transitions',
    description: '800+ dynamic camera pans, light leaks, modern zooms, and sleek glides with built-in realistic motion blur.',
    count: '800+',
    category: 'Speed & Motion',
    badge: 'Best Seller',
    iconName: 'MoveRight',
    features: ['Auto-resize aspect ratios', 'Sound effects pre-mapped', 'GPU-accelerated rendering']
  },
  {
    id: 'luts',
    title: 'Professional LUTs',
    description: '450+ standard cinetone LUTs inspired by blockbuster films, graded carefully for standard camera profiles (Log, Rec709).',
    count: '450+',
    category: 'Color Grading',
    badge: 'Pro Quality',
    iconName: 'Palette',
    features: ['Alexa, Red, Sony log mappings', 'Clean skin-tone protection', 'Cinematic teal & orange collection']
  },
  {
    id: 'sfx',
    title: 'Hollywood Sound Effects',
    description: '1,200+ pristine, high-fidelity sound effects designed to build tension, impact, and deep tactile immersion.',
    count: '1,200+',
    category: 'Audio assets',
    badge: '96kHz WAV',
    iconName: 'Volume2',
    features: ['Risers, impacts, swooshes', 'Atmospheric room tones', 'Fully royalty-free certificate']
  },
  {
    id: 'mograph',
    title: 'Motion Graphics (MOGRT)',
    description: '600+ animated modern titles, cyber-punk lower thirds, clean callouts, and minimal social media popups.',
    count: '600+',
    category: 'Text & Titles',
    badge: 'Customisable',
    iconName: 'Sparkles',
    features: ['Edit text directly in timeline', 'Change colors without keyframing', 'Responsive auto-scaling box']
  },
  {
    id: 'overlays',
    title: 'Organic Light & Film Overlays',
    description: '300+ authentic analog film burns, light leaks, realistic lens flares, and dust textures shot on real 35mm cameras.',
    count: '300+',
    category: 'Textures / Atmosphere',
    badge: '4K Ultra HD',
    iconName: 'Layers',
    features: ['Easy overlay blend modes', 'Organic cinematic textures', 'Vibrant light refraction animations']
  },
  {
    id: 'templates',
    title: 'Social Media Templates',
    description: '100+ fully-structured, hyper-engaging sequence templates custom-ready for TikTok, YT Shorts, and Insta Reels.',
    count: '100+',
    category: 'Social Mastery',
    badge: 'High Engagement',
    iconName: 'Smartphone',
    features: ['Paced for high retention', 'Captions styling presets', 'Pre-edited narrative flow blocks']
  },
  {
    id: 'icons',
    title: 'Animated Vector Icons',
    description: '500+ high-quality animated flat icons perfect for tech explainers, reviews, and dynamic visual storytelling.',
    count: '500+',
    category: 'Graphics',
    badge: 'Fully Resizable',
    iconName: 'Compass',
    features: ['No frame rate loss', 'Minimalist, modern styling', 'Transparent alpha channel channels']
  },
  {
    id: 'film_grains',
    title: 'VHS & Retro Overlays',
    description: '200+ premium vintage film grains, retro glitch blocks, camera HUD overlays, and aesthetic VHS noise generators.',
    count: '200+',
    category: 'Textures',
    badge: 'Nostalgic Vibe',
    iconName: 'Tv',
    features: ['8mm, 16mm, and 35mm formats', 'Adjustable dynamic fuzziness', 'Audio retro hum effects']
  },
  {
    id: 'ae_plugins',
    title: '100+ After Effects Plugins',
    description: '100+ premium VFX helper modules, custom automation scripts, automatic kinetic text loaders, and advanced visual expressions.',
    count: '100+',
    category: 'VFX & Automation',
    badge: 'Interactive FX',
    iconName: 'Zap',
    features: ['1-Click text and visual riggers', 'Expression-based smooth motion physics', 'Compatible with AE CC and above']
  },
  {
    id: 'background_music',
    title: 'Royalty Free Background Music',
    description: '150+ high-quality cinematic backdrops, corporate ambient tunes, upbeat modern beats, and acoustic acoustic tracks.',
    count: '150+',
    category: 'Audio & Music',
    badge: 'Unlimited Use',
    iconName: 'Volume2',
    features: ['High-quality WAV & MP3 files', '100% royalty-free certificate', 'Perfect for YouTube & podcasts']
  },
  {
    id: 'background_video_animation',
    title: 'Background Video Animation',
    description: '120+ high-definition ambient looping backgrounds, retro wave visual grids, cosmic patterns, and abstract motion loops.',
    count: '120+',
    category: 'Motion Graphics',
    badge: 'Seamless Loops',
    iconName: 'MonitorPlay',
    features: ['1080p & 4K High-Definition clips', 'Perfectly seamless repeating renders', 'For streamers, music vids, & visual sets']
  },
  {
    id: 'dust_snow_overlay',
    title: 'Dust & Snow Particle Overlay',
    description: '120+ high-definition atmospheric overlay assets, realistic drifting snow, cinematic floating dust, and slow-motion embers.',
    count: '120+',
    category: 'VFX Overlays',
    badge: 'Cinematic FX',
    iconName: 'Sparkles',
    features: ['Real lens-captured floating dust', 'Seamless looping organic snow paths', 'Instant blending transparency (Screen/Add)']
  }
];

export const LOVE_REASONS: LoveReason[] = [
  {
    id: 'save_time',
    title: 'Save Cutting-Room Hours',
    description: 'Say goodbye to hours of repetitive keyframing. Drag and drop ready-made transition nodes, LUTs, and typography, delivering projects up to 10x faster.',
    iconName: 'Clock',
    metric: 'Save 12hrs/week'
  },
  {
    id: 'pro_results',
    title: 'Elevate to Hollywood Grade',
    description: 'Deliver stunning, high-retention video content that looks and sounds as if it has been crafted by an entire agency group, and stand out in the crowded feed.',
    iconName: 'Award',
    metric: 'Premium Cinema Finish'
  },
  {
    id: 'easy_use',
    title: 'Simple Drag & Drop Workflow',
    description: 'No complicated advanced tutorials required. Every file is clearly organized, numbered, and instantly compatible with standard drag-and-drop workflows.',
    iconName: 'Fingerprint',
    metric: 'Zero Learning Curve'
  },
  {
    id: 'software',
    title: 'Cross-Software Compatibility',
    description: 'Works seamlessly across Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro (FCPX), Sony Vegas, CapCut Desktop, and photoshop.',
    iconName: 'MonitorPlay',
    metric: 'Universal Extension'
  },
  {
    id: 'one_time',
    title: 'One-Time Payment, Lifetime Access',
    description: 'Ditch recurring subscriptions. Pay once and get full lifetime unlimited downloads, plus all future asset additions and templates free of charge.',
    iconName: 'ShieldCheck',
    metric: 'No Hidden Fees'
  }
];

export const PREVIEWS: PreviewItem[] = [
  {
    id: 'color-grading',
    title: 'Cinematic Color Grading (LUTs)',
    description: 'Instantly transform flat, washed-out Log space camera feeds into vibrant, rich cinematic stories.',
    beforeImg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=50&sat=-60&contrast=80', // raw look
    afterImg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80', // cinematic look
    tag: 'COLOR GRADING'
  },
  {
    id: 'light-leak',
    title: 'Organic Analog Light Leaks',
    description: 'Blend subtle vintage textures to establish dynamic narrative shifts and retro styles.',
    beforeImg: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=50&blur=4', // standard look
    afterImg: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80', // dynamic vibrant look
    tag: 'FILM OVERLAYS'
  },
  {
    id: 'social-captions',
    title: 'Retention-Optimized Typography',
    description: 'Keep viewers glued to the screen with modern typography that matches trending social edits.',
    beforeImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=50',
    afterImg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    tag: 'CAPTION TEMPLATES'
  }
];

export const TARGET_SEGMENTS: UserSegment[] = [
  {
    id: 'content_creators',
    title: 'Content Creators',
    description: 'Elevate your channel production value, keep eyes glued to reels, and boost your monthly viewership counts easily.',
    useCase: 'Reels, YouTube, TikTok short-form styling',
    iconName: 'Sparkles'
  },
  {
    id: 'youtubers',
    title: 'Educators & YouTubers',
    description: 'Keep your visual narratives cohesive, dynamic, and educational with drag and drop titles, transitions, and text guides.',
    useCase: 'Vlogs, long-form documentary, tutorials',
    iconName: 'Youtube'
  },
  {
    id: 'freelancers',
    title: 'Freelance Editors',
    description: 'Double your project output, shorten feedback loop iterations, and charge premium agency rates for your final outputs.',
    useCase: 'Client editing gigs, commercial briefs',
    iconName: 'Briefcase'
  },
  {
    id: 'social_managers',
    title: 'Social Medial Managers',
    description: 'Consistently pop out aesthetic, scroll-stopping clips in under ten minutes to match the rapid speed of viral feeds.',
    useCase: 'Brand building, rapid social content',
    iconName: 'Instagram'
  },
  {
    id: 'agencies',
    title: 'Production Agencies',
    description: 'Standardize asset workflows across your remote editor teams to achieve consistent brand tone and lightning output.',
    useCase: 'Commercial campaigns, quick scale workflows',
    iconName: 'Layers'
  },
  {
    id: 'novice_editors',
    title: 'Beginning Editors',
    description: 'Skip years of painful technical tutorial hunting. Get professional visual grade out of the box with zero previous training.',
    useCase: 'Hobby editing, personal vlogs, study',
    iconName: 'UserCheck'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'review_1',
    name: 'Marcus K.',
    role: 'Freelance Commercial Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5,
    text: 'This bundle single-handedly saved me over 30 hours on my last three commercial client revisions. The sound design alone is easily worth 5 times the bundle price. Cannot recommend it highly enough!',
    verified: true,
    platform: 'freelance'
  },
  {
    id: 'review_2',
    name: 'Sarah Chen',
    role: 'Lifestyle YouTuber (140k Subs)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5,
    text: 'My viewer retention rates increased by nearly 32% since I started using the TikTok template layouts and transition packs. It makes my vlog videos look incredibly professional without making me live at my computer!',
    verified: true,
    platform: 'youtube'
  },
  {
    id: 'review_3',
    name: 'Vikram Joshi',
    role: 'Creative Director at VeloMedia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5,
    text: 'We bought the agency commercial license and it standardized our editing workflows across 5 remote video editors. The cinematic film overlays and seamless pans are absolutely gorgeous. High professional grade.',
    verified: true,
    platform: 'instagram'
  },
  {
    id: 'review_4',
    name: 'Elena Rostova',
    role: 'Instagram / Reel Strategist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    rating: 5,
    text: 'It is direct, straightforward, and works on CapCut Desktop too! As a social media manager, speed is my currency. I can edit and publish 5 high-quality viral reels in literally under one hour. Absolute game changer.',
    verified: true,
    platform: 'instagram'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I download the asset bundle after buying?',
    answer: 'Instantly! Immediately after processing your secure checkout, you will be redirected to our premium private storage area containing simple Google Drive and high-speed server mirror download links. You will also receive an automated invoice receipt containing these links direct to your registered email.'
  },
  {
    id: 'faq_2',
    question: 'Is this bundle compatible with standard editing programs?',
    answer: 'Yes! Our custom-packaged LUTs, Transitions, templates, Overlay textures, and Sound FX are compatible with all modern software: Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro (FCPX), Sony Vegas, CapCut Desktop, Alight Motion, and LumaFusion.'
  },
  {
    id: 'faq_3',
    question: 'Is it a one-time purchase or a recurring monthly subscription fee?',
    answer: 'This is a strict 100% one-time lifetime purchase! There are no hidden charges, monthly fees, or automatic renewal surprises. You pay once and get unrestricted lifetime access plus future asset updates completely free.'
  },
  {
    id: 'faq_4',
    question: 'Can I use these assets to edit client or commercial work?',
    answer: 'Absolutely! Every purchase comes with our comprehensive Unlimited Commercial Use License. You can safely utilize these transitions, sound designs, color presets, and overlay elements in client projects, commercial spots, YouTube monetization networks, and movie features without paying royalties.'
  },
  {
    id: 'faq_5',
    question: 'What happens if I don\'t know how to import or install them?',
    answer: 'We have you covered! The package comes complete with easy, step-by-step PDF installation manuals and video tutorials. If you ever get stuck, our priority customer response crew is available at contact@editorsbundle.co to walk you through it.'
  },
  {
    id: 'faq_6',
    question: 'What is the format and resolution of the overlays?',
    answer: 'Our analog light leaks, overlays, and grainy textures are shot in beautiful 4K Ultra HD (3840x2160) at cinematic rates. They are outputted as highly-optimized H264/MP4 files that render smoothly in background timelines without slowing down your computer.'
  }
];

export const PRICING: PricingPlan = {
  name: 'Video Editing Mega Bundle',
  tagline: 'EVERYTHING YOU WILL EVER NEED TO PRODUCE VIRAL CHANNELS AND CLINCH TOP CLIENTS',
  originalPrice: '$199.00',
  currentPrice: '$9.00',
  savings: 'Save 95% Today',
  features: [
    '1,500+ Cinematic Premium Presets',
    '800+ Smooth Seamless Transitions',
    '450+ Movie-Standard Cinematic LUTs',
    '1,200+ Cine-Grade Foley & Accent FX',
    '600+ Title Cards & Motion Graphics (MOGRTs)',
    '300+ Light Leaks & Overlay Burns',
    '100+ Viral Caption & Reel Templates',
    'Lifetime Extended commercial use license',
    'High-Speed download link mirrors',
    'Comprehensive user manuals & PDF notes',
    'Free Lifetime VIP community access'
  ],
  paymentLinks: {
    // Add real link callbacks easily. For user experience, these can trigger our interactive Checkout modal or sandbox success triggers!
    stripe: 'https://checkout.stripe.com/pay/cs_live...',
    paypal: 'https://www.paypal.com/cgi-bin/webscr...',
    razorpay: 'https://rzp.io/l/video_bundle_mega',
    upi: 'pay?pa=editorsmega@upi&pn=BundleSales',
    generic: '#buy-now'
  }
};

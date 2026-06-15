/**
 * Shared Type Definitions for Video Editing Mega Bundle Landing Page
 */

export interface IncludedAsset {
  id: string;
  title: string;
  description: string;
  count: string;
  category: string;
  badge?: string;
  iconName: string; // To match lucide icon names dynamically
  features: string[];
}

export interface LoveReason {
  id: string;
  title: string;
  description: string;
  iconName: string;
  metric?: string;
}

export interface PreviewItem {
  id: string;
  title: string;
  description: string;
  beforeImg: string;
  afterImg: string;
  tag: string;
}

export interface UserSegment {
  id: string;
  title: string;
  description: string;
  useCase: string;
  iconName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  verified: boolean;
  platform: 'instagram' | 'youtube' | 'facebook' | 'freelance';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PricingPlan {
  name: string;
  tagline: string;
  originalPrice: string;
  currentPrice: string;
  savings: string;
  features: string[];
  paymentLinks: {
    stripe?: string;
    paypal?: string;
    razorpay?: string;
    upi?: string;
    generic?: string;
  };
}

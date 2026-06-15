import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, FileText, RefreshCw, Mail, Clock, Shield } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'privacy' | 'terms' | 'refund' | 'contact';
}

type TabType = 'privacy' | 'terms' | 'refund' | 'contact';

export default function PolicyModal({ isOpen, onClose, initialTab }: PolicyModalProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: <ShieldCheck size={14} /> },
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={14} /> },
    { id: 'refund', label: 'Refund Policy', icon: <RefreshCw size={14} /> },
    { id: 'contact', label: 'Contact US', icon: <Mail size={14} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'privacy':
        return (
          <div className="space-y-5 text-zinc-300 text-xs md:text-sm leading-relaxed" id="policy-privacy-content">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Shield className="text-violet-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Privacy Policy</h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Effective Date: June 14, 2026</p>
            
            <p>
              EditorsMega (“we”, “our”, or “us”) is dedicated to processing customer transactions transparently. This Privacy Policy outlines the simple and transparent parameters of data handling.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-zinc-200">1. Information We Collect</h4>
              <p>
                To complete your secure order and deliver key download packages, we receive limited standard data: Name and Email Address. Financial transaction processing is handled via standard secure payment facilitators (such as PayPal, Razorpay, or local banks) via standard AES-256 secure APIs. We do not store credit card or raw banking identifiers on our servers.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">2. Usage of Customer Data</h4>
              <p>
                Your secure email coordinates are utilized solely for delivering your license files, coordinating automatic version updates of downloaded transitions and assets, and answering communication requests sent directly by you.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">3. Functional Cookies</h4>
              <p>
                We employ clean, temporary functional session cookies. These enable secure tracking of checkout parameters, ensure download token protection, and support interactive media components. No marketing tracking pixels or behavioral networks are loaded.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">4. Third-Party Restrictions</h4>
              <p>
                We do not resell, rent, trade, or distribute customer email lists or transaction details to outer marketing networks. Your records remain strictly protected under general GDPR/CCPA guidelines.
              </p>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-5 text-zinc-300 text-xs md:text-sm leading-relaxed" id="policy-terms-content">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <FileText className="text-violet-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Terms & Conditions</h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Effective Date: June 14, 2026</p>
            
            <p>
              By purchasing, acquiring, downloading, or integrating digital packages from EditorsMega, you unconditionally agree to abide by the licensing metrics detailed within:
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-zinc-200">1. Intellectual Property & License</h4>
              <p>
                Every purchase covers a lifetime, royalty-free Extended License allowing unlimited use of video resources, SFX, transition overlays, and color grading materials for personal, studio, and commercial client monetization.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">2. Redirection Limits & Prohibited Actions</h4>
              <p>
                You are strictly prohibited from reselling or repackaging raw video presets, zip folders, or configuration files in their raw formats as competing standalone distributions or stock resources.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">3. Purchases & Access Rights</h4>
              <p>
                Digital delivery is instant. To assure smooth support, users must input active, correct email addresses. EditorsMega retains the authority to void download privileges in cases where persistent manual billing chargeback abuse or file package leak structures are identified.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">4. Standard Disclaimer</h4>
              <p>
                Our digital goods are provided "as is" and compatible with industry major suites (including DaVinci, Premiere, FCPX, etc.). We do not warrant uninterrupted operation across unstandardized setups.
              </p>
            </div>
          </div>
        );
      case 'refund':
        return (
          <div className="space-y-5 text-zinc-300 text-xs md:text-sm leading-relaxed" id="policy-refund-content">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <RefreshCw className="text-violet-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Refund Policy</h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Effective Date: June 14, 2026</p>
            
            <p>
              We want you to be fully assured when shopping at EditorsMega. Here is how we handle refunds for digital assets:
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-zinc-200">1. 14-Day Satisfaction Guarantee</h4>
              <p>
                We offer a clear, professional 14-Day technical satisfaction window. If you experience unexpected compatibility issues, layout problems, or performance dropouts with our templates on standard editing softwares that our technical staff cannot fix, a full 100% refund will be issued immediately.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">2. Processing Refund Requests</h4>
              <p>
                To initiate a claim, please submit a formal email update containing your item's purchase receipt coordinate to <strong className="text-white">support@editorsbundle.co</strong>. Our team responds within 12-24 hours to coordinate secure transaction reversals.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-zinc-200">3. Safety Audits</h4>
              <p>
                Since direct media downloads cannot be physically reclaimed, we monitor technical server download logs to isolate fraudulent checkout strategies while ensuring genuine editors are fully taken care of.
              </p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-5 text-zinc-300 text-xs md:text-sm leading-relaxed" id="policy-contact-content">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Mail className="text-violet-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Contact US</h3>
            </div>
            
            <p>
              Need operational assistance with download keys, license verification, or compatibility setups? Our support engineers are standing by.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">Direct Email</span>
                <a href="mailto:support@editorsbundle.co" className="text-violet-400 font-bold hover:underline">
                  support@editorsbundle.co
                </a>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">Corporate Office</span>
                <span className="text-white font-semibold block">
                  EditorsMega, Inc.
                </span>
                <span className="text-zinc-400 text-xs">Delaware, United States</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-zinc-250">
                <Clock className="text-zinc-500" size={14} />
                <span className="font-semibold text-zinc-200">Response Period:</span>
              </div>
              <p className="text-zinc-400">
                Guaranteed email support feedback within 12 to 24 business hours. We operate 24/7 in rotative global teams to assist with download inquiries.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent Backdrop Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Main Dialog Panel Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-3xl h-[600px] max-h-[90vh] rounded-2xl border border-zinc-800 bg-[#0c0c0e] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side Sidebar - Tab Navigation toggler */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/35 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0 select-none">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 mb-4 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-zinc-500">
              Legal Compliance
            </span>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap md:w-full select-none ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/10'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-mono text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Content Panel Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0a0a0c] flex flex-col justify-between">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer z-10"
            aria-label="Close"
          >
            <X size={15} />
          </button>

          <div className="flex-1 pr-1">
            {renderContent()}
          </div>

          <div className="border-t border-zinc-900/60 pt-4 mt-6 flex justify-between items-center text-[9px] font-mono text-zinc-500 select-none">
            <span>Secure Connection Approved</span>
            <span>PCI-DSS Secured Gateway Support</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

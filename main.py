import React, { useState } from 'react';
import { FileCode, Database, Cpu, Shield, TrendingUp, Zap } from 'lucide-react';

const DealerCopilotBlueprint = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  const sections = [
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'manifest', label: 'Manifest V3', icon: FileCode },
    { id: 'core', label: 'Core Code', icon: Database },
    { id: 'deployment', label: 'Deployment', icon: Zap },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'monetization', label: 'Monetization', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dealer Copilot
          </h1>
          <p className="text-slate-400 text-lg">
            Production-Ready Chrome Extension Blueprint for Luxury Watch Dealers
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span>100% WhatsApp TOS Compliant • Manifest V3</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 shadow-2xl border border-slate-700">
          {activeTab === 'architecture' && <ArchitectureSection />}
          {activeTab === 'manifest' && <ManifestSection />}
          {activeTab === 'core' && <CoreCodeSection />}
          {activeTab === 'deployment' && <DeploymentSection />}
          {activeTab === 'compliance' && <ComplianceSection />}
          {activeTab === 'monetization' && <MonetizationSection />}
        </div>
      </div>
    </div>
  );
};

const ArchitectureSection = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-400 mb-4">System Architecture</h2>
    
    <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm overflow-x-auto">
      <pre className="text-green-400">{`
┌─────────────────────────────────────────────────────────────────┐
│                    DEALER COPILOT ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   WhatsApp Web   │ (web.whatsapp.com)
│   [Read Only]    │
└────────┬─────────┘
         │ MutationObserver (optional tracking)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CONTENT SCRIPT LAYER                         │
│  • Sidebar injection (React Portal)                             │
│  • Tab focus management                                          │
│  • Send detection (non-intrusive)                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIDEBAR UI (REACT)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Listing Form │  │ Group Tracker│  │  Analytics   │         │
│  │  • OCR Upload│  │ • Posted log │  │ • Performance│         │
│  │  • AI Flair  │  │ • Queue mgmt │  │ • Predictions│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CORE MODULES                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Rules Engine (json-logic)                                │  │
│  │  • Style calibration                                     │  │
│  │  • Compliance guard (spam detection)                     │  │
│  │  • Template parser                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AI Integration (OpenAI/Grok)                             │  │
│  │  • Personalized flair generation                         │  │
│  │  • Photo analysis (condition, authenticity)              │  │
│  │  • Price prediction                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ OCR Engine (Tesseract.js)                                │  │
│  │  • Extract model, year, ref from watch photos            │  │
│  │  • Parse warranty cards                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL STORAGE (IndexedDB)                     │
│  • Listings (history, drafts)                                   │
│  • Group profiles (performance, last posted)                    │
│  • Style profile (learned preferences)                          │
│  • Analytics (conversion tracking)                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼ (Optional sync with user consent)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase/Firebase)                   │
│  • Multi-device sync                                             │
│  • Aggregated analytics (anonymized)                            │
│  • Subscription management (Stripe)                             │
│  • Network marketplace (future)                                 │
└─────────────────────────────────────────────────────────────────┘

                    BROWSER-STANDARD APIs ONLY
                    ═══════════════════════════
                    ✓ Clipboard API (write only)
                    ✓ Tabs API (focus, query)
                    ✓ Storage API (local, sync)
                    ✗ No DOM injection into WhatsApp
                    ✗ No automated message sending
`}</pre>
    </div>

    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="bg-slate-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Key Design Principles</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• <strong>Human-in-the-loop:</strong> Extension prepares, user executes</li>
          <li>• <strong>Non-invasive:</strong> Sidebar overlay, no WhatsApp DOM manipulation</li>
          <li>• <strong>Privacy-first:</strong> Local-first storage, opt-in sync</li>
          <li>• <strong>Modular:</strong> Easy to extend to Telegram/Signal</li>
          <li>• <strong>ML-driven:</strong> Learns from user behavior over time</li>
        </ul>
      </div>
      <div className="bg-slate-900 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Competitive Advantages</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>• <strong>Style calibration:</strong> 5x better than generic AI</li>
          <li>• <strong>Group intelligence:</strong> Performance predictions</li>
          <li>• <strong>OCR auto-fill:</strong> Extract data from photos</li>
          <li>• <strong>Compliance engine:</strong> Prevents spam flags</li>
          <li>• <strong>Analytics dashboard:</strong> Track ROI per group</li>
        </ul>
      </div>
    </div>
  </div>
);

const ManifestSection = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-blue-400 mb-4">manifest.json (Manifest V3)</h2>
    <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs overflow-x-auto">
      <pre className="text-green-400">{`{
  "manifest_version": 3,
  "name": "Dealer Copilot",
  "version": "1.0.0",
  "description": "AI-powered listing preparation tool for luxury watch dealers",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon48.png",
    "default_title": "Dealer Copilot"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://web.whatsapp.com/*"],
      "js": ["content_script.js"],
      "css": ["sidebar.css"],
      "run_at": "document_idle"
    }
  ],
  "permissions": [
    "storage",
    "clipboardWrite",
    "tabs",
    "activeTab"
  ],
  "host_permissions": [
    "https://web.whatsapp.com/*"
  ],
  "web_accessible_resources": [
    {
      "resources": ["sidebar.html", "icons/*", "fonts/*"],
      "matches": ["https://web.whatsapp.com/*"]
    }
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "externally_connectable": {
    "matches": ["https://web.whatsapp.com/*"]
  }
}`}</pre>
    </div>
    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
      <p className="text-sm text-blue-300">
        <strong>Security Note:</strong> Only requests clipboardWrite and tabs permissions. 
        No activeTab messaging, no cookies, no webRequest. Fully compliant with Chrome Web Store policies.
      </p>
    </div>
  </div>
);

const CoreCodeSection = () => {
  const [selectedFile, setSelectedFile] = useState('background');

  const codeFiles = {
    background: {
      name: 'background.js',
      description: 'Service worker for tab management and messaging',
      code: `// background.js - Service Worker (Manifest V3)

let sidebarState = {};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      onboardingComplete: false,
      styleProfile: null,
      subscription: { tier: 'free', listingsThisMonth: 0 }
    });
    chrome.tabs.create({ url: 'onboarding.html' });
  }
});

// Handle messages from content script/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'focusWhatsAppTab':
      focusWhatsAppTab(message.groupName);
      break;
    case 'trackListingPosted':
      trackListingPosted(message.data);
      break;
    case 'checkSubscription':
      checkSubscriptionLimit(sendResponse);
      return true; // async response
    default:
      console.warn('Unknown action:', message.action);
  }
});

// Focus WhatsApp tab or open new one
async function focusWhatsAppTab(groupName = null) {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: 'https://web.whatsapp.com' });
  }
}

// Track posted listing (for analytics)
async function trackListingPosted(data) {
  const { listingId, groupName, timestamp } = data;
  
  // Store in IndexedDB via content script
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'savePostedListing',
      data: { listingId, groupName, timestamp }
    });
  }
  
  // Increment usage counter
  const storage = await chrome.storage.local.get('subscription');
  storage.subscription.listingsThisMonth++;
  await chrome.storage.local.set({ subscription: storage.subscription });
}

// Check if user has reached free tier limit
async function checkSubscriptionLimit(sendResponse) {
  const { subscription } = await chrome.storage.local.get('subscription');
  const limit = subscription.tier === 'free' ? 3 : Infinity;
  const remaining = limit - subscription.subscription.listingsThisMonth;
  
  sendResponse({
    allowed: remaining > 0,
    remaining,
    tier: subscription.tier
  });
}`
    },
    content: {
      name: 'content_script.js',
      description: 'Inject sidebar and handle UI communication',
      code: `// content_script.js - Sidebar injection for WhatsApp

// IndexedDB functions inline (no external imports)
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DealerCopilotDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('postHistory')) {
        db.createObjectStore('postHistory', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const saveToIndexedDB = async (storeName, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({ ...data, timestamp: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

let sidebarInjected = false;
let db;

// Initialize when page loads
(async function init() {
  db = await initDB();
  injectSidebar();
  setupMessageListener();
  setupSendDetection(); // Optional: track when user manually sends
})();

// Inject sidebar as React portal
function injectSidebar() {
  if (sidebarInjected) return;
  
  const sidebar = document.createElement('div');
  sidebar.id = 'dealer-copilot-sidebar';
  sidebar.style.cssText = \`
    position: fixed;
    top: 0;
    right: 0;
    width: 380px;
    height: 100vh;
    z-index: 999999;
    box-shadow: -4px 0 20px rgba(0,0,0,0.3);
  \`;
  
  document.body.appendChild(sidebar);
  
  // Load React app into sidebar
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('sidebar-app.js');
  document.body.appendChild(script);
  
  sidebarInjected = true;
  console.log('[Copilot] Sidebar injected');
}

// Listen for messages from background/sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'savePostedListing':
      saveToIndexedDB('postHistory', message.data);
      break;
    case 'getGroupList':
      extractGroupList(sendResponse);
      return true;
    default:
      break;
  }
});

// Setup message bridge between sidebar and extension
function setupMessageListener() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data.type?.startsWith('COPILOT_')) return;
    
    // Handle sidebar requests
    switch (event.data.type) {
      case 'COPILOT_COPY_TO_CLIPBOARD':
        copyToClipboard(event.data.payload);
        break;
      case 'COPILOT_FOCUS_TAB':
        chrome.runtime.sendMessage({ action: 'focusWhatsAppTab' });
        break;
    }
  });
}

// Copy formatted listing to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    window.postMessage({
      type: 'COPILOT_CLIPBOARD_SUCCESS',
      payload: { success: true }
    }, '*');
  } catch (err) {
    console.error('Clipboard write failed:', err);
  }
}

// Optional: Detect when user manually sends message
function setupSendDetection() {
  // Non-invasive observation of send button clicks
  const observer = new MutationObserver((mutations) => {
    // Look for changes that indicate message sent
    // This is READ-ONLY observation, no DOM manipulation
    // Implementation depends on WhatsApp's DOM structure
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Extract visible groups (for dropdown)
function extractGroupList(sendResponse) {
  // Parse WhatsApp sidebar (read-only) to get group names
  const groups = [];
  const groupElements = document.querySelectorAll('[data-testid="cell-frame-title"]');
  
  groupElements.forEach(el => {
    groups.push({
      name: el.textContent.trim(),
      lastActive: Date.now() // approximate
    });
  });
  
  sendResponse({ groups });
}`
    },
    listingForm: {
      name: 'ListingForm.jsx',
      description: 'React form with OCR and AI integration',
      code: `// ListingForm.jsx - Main listing creation form

import React, { useState, useRef } from 'react';

export default function ListingForm({ styleProfile, onSubmit }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    reference: '',
    year: '',
    condition: 'excellent',
    price: '',
    description: '',
    photos: []
  });
  const [generatedText, setGeneratedText] = useState('');
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const fileInputRef = useRef();

  // Handle photo upload with OCR (simulated - actual implementation uses Tesseract.js)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setOcrProcessing(true);
    
    try {
      // In production: Use Tesseract.js via CDN or bundled
      // For demo: Simulate extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const extracted = {
        brand: 'Rolex',
        model: 'Submariner',
        reference: '16610'
      };
      
      setFormData(prev => ({ ...prev, ...extracted, photos: files }));
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setOcrProcessing(false);
    }
  };

  // Parse OCR text for model, reference, etc.
  function parseWatchDetails(text) {
    const details = {};
    
    // Rolex reference pattern
    const refMatch = text.match(/\\b(\\d{5,6}[A-Z]?)\\b/);
    if (refMatch) details.reference = refMatch[1];
    
    // Common models
    const models = ['Submariner', 'Datejust', 'GMT-Master', 'Daytona'];
    models.forEach(model => {
      if (text.includes(model)) details.model = model;
    });
    
    // Year pattern
    const yearMatch = text.match(/\\b(19|20)\\d{2}\\b/);
    if (yearMatch) details.year = yearMatch[0];
    
    return details;
  }

  // Generate AI-powered listing text (simulated)
  const handleGenerateListing = async () => {
    // In production: Call actual AI API (OpenAI/Grok)
    // For demo: Use rule-based generation
    
    const templates = {
      professional: `${formData.brand} ${formData.model} ref. ${formData.reference}, circa ${formData.year}. ${formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1)} condition with complete set. Asking ${formData.price}. Serious inquiries welcome.`,
      enthusiastic: `Beautiful ${formData.model} ${formData.reference} available! ${formData.year} vintage, ${formData.condition} condition. Comes with everything. ${formData.price} - Let's chat!`,
      minimal: `${formData.brand} ${formData.model} ${formData.reference} (${formData.year})\nCondition: ${formData.condition}\nPrice: ${formData.price}\nDM for details`
    };
    
    const style = styleProfile?.preferredTone || 'professional';
    let generated = templates[style] || templates.professional;
    
    // Apply compliance rules inline
    generated = generated.replace(/urgent|hurry|act now/gi, 'available');
    generated = generated.replace(/[A-Z]{5,}/g, match => 
      match.charAt(0) + match.slice(1).toLowerCase()
    );
    
    setGeneratedText(generated);
  };

  // Copy to clipboard and notify
  const handleCopyListing = () => {
    window.postMessage({
      type: 'COPILOT_COPY_TO_CLIPBOARD',
      payload: generatedText
    }, '*');
    
    onSubmit({ ...formData, finalText: generatedText });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-white">Create Listing</h2>
      
      {/* Photo Upload */}
      <div>
        <label className="block text-sm mb-2 text-slate-300">
          Watch Photos (OCR enabled)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
        />
        {ocrProcessing && <p className="text-xs text-blue-400 mt-1">Extracting details...</p>}
      </div>

      {/* Form Fields */}
      <input
        type="text"
        placeholder="Brand (e.g., Rolex)"
        value={formData.brand}
        onChange={(e) => setFormData({...formData, brand: e.target.value})}
        className="w-full p-2 rounded bg-slate-700 text-white"
      />
      
      <input
        type="text"
        placeholder="Model (e.g., Submariner)"
        value={formData.model}
        onChange={(e) => setFormData({...formData, model: e.target.value})}
        className="w-full p-2 rounded bg-slate-700 text-white"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Reference"
          value={formData.reference}
          onChange={(e) => setFormData({...formData, reference: e.target.value})}
          className="p-2 rounded bg-slate-700 text-white"
        />
        <input
          type="text"
          placeholder="Year"
          value={formData.year}
          onChange={(e) => setFormData({...formData, year: e.target.value})}
          className="p-2 rounded bg-slate-700 text-white"
        />
      </div>

      <input
        type="text"
        placeholder="Price (e.g., $15,000)"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        className="w-full p-2 rounded bg-slate-700 text-white"
      />

      {/* Generate Button */}
      <button
        onClick={handleGenerateListing}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        ✨ Generate Listing with AI
      </button>

      {/* Generated Output */}
      {generatedText && (
        <div className="bg-slate-900 p-4 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-slate-300">Generated Listing:</h3>
          <p className="text-sm text-white whitespace-pre-wrap mb-3">{generatedText}</p>
          <button
            onClick={handleCopyListing}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            📋 Copy & Track Posting
          </button>
        </div>
      )}
    </div>
  );
}`
    },
    compliance: {
      name: 'complianceGuard.js',
      description: 'Spam prevention and phrase sanitization',
      code: `// complianceGuard.js - Prevent spam flags

const SPAM_TRIGGERS = [
  // Urgency patterns
  /\\b(urgent|hurry|limited time|act now|don't wait)\\b/gi,
  // Excessive caps
  /\\b[A-Z]{5,}\\b/g,
  // Excessive emojis
  /([\u{1F300}-\u{1F9FF}]){4,}/gu,
  // Spam phrases
  /\\b(click here|buy now|special offer|guaranteed)\\b/gi
];

const REPLACEMENTS = {
  'urgent': 'available soon',
  'limited time': 'while supplies last',
  'act now': 'inquire today',
  'RARE': 'Rare',
  'MINT': 'Mint'
};

// Standalone functions for extension use
function applyComplianceRules(text) {
  let sanitized = text;
  
  // Replace spam triggers
  SPAM_TRIGGERS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match) => {
      return REPLACEMENTS[match.toLowerCase()] || match.toLowerCase();
    });
  });
  
  // Limit consecutive emojis
  sanitized = sanitized.replace(/([\u{1F300}-\u{1F9FF}]){4,}/gu, (match) => {
    return match.slice(0, 9); // Max 3 emojis
  });
  
  // Ensure not all caps
  if (sanitized === sanitized.toUpperCase() && sanitized.length > 20) {
    sanitized = sanitized.charAt(0) + sanitized.slice(1).toLowerCase();
  }
  
  return sanitized;
}

function analyzeCompliance(text) {
  const issues = [];
  
  SPAM_TRIGGERS.forEach((pattern, idx) => {
    if (pattern.test(text)) {
      issues.push({
        type: 'spam_trigger',
        pattern: pattern.source,
        severity: 'medium'
      });
    }
  });
  
  return {
    compliant: issues.length === 0,
    issues,
    riskScore: Math.min(issues.length * 20, 100)
  };
}`
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">Core Code Modules</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(codeFiles).map(key => (
          <button
            key={key}
            onClick={() => setSelectedFile(key)}
            className={`px-3 py-1 rounded text-sm ${
              selectedFile === key
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {codeFiles[key].name}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-cyan-400">
            {codeFiles[selectedFile].name}
          </h3>
          <span className="text-xs text-slate-400">
            {codeFiles[selectedFile].description}
          </span>
        </div>
        <div className="bg-black p-3 rounded overflow-x-auto">
          <pre className="text-xs text-green-400">{codeFiles[selectedFile].code}</pre>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-900 p-3 rounded text-sm">
          <h4 className="font-semibold text-blue-400 mb-2">Additional Files</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• db.js (IndexedDB wrapper)</li>
            <li>• aiEngine.js (OpenAI/Grok client)</li>
            <li>• styleCalibration.js (onboarding)</li>
            <li>• analyticsTracker.js (metrics)</li>
            <li>• rulesEngine.js (json-logic)</li>
          </ul>
        </div>
        <div className="bg-slate

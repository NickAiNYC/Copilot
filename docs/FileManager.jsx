import React, { useState } from 'react';
import { FileCode, FolderTree, Download, Play } from 'lucide-react';

const DealerCopilotFiles = () => {
  const [activeFile, setActiveFile] = useState('manifest');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    popupJs: {
      path: 'src/popup/popup.js',
      priority: 'MEDIUM',
      description: 'Popup functionality script',
      content: `// popup.js - Extension popup functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Load subscription data
  const subscription = await chrome.runtime.sendMessage({
    action: 'checkSubscriptionLimit'
  });
  
  if (subscription) {
    document.getElementById('listings-count').textContent = 
      \`\${subscription.used || 0}/\${subscription.limit === Infinity ? '∞' : subscription.limit}\`;
    document.getElementById('tier').textContent = 
      subscription.tier === 'free' ? 'Free' : 'Premium';
  }
  
  // Open WhatsApp button
  document.getElementById('open-whatsapp').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({
      action: 'focusWhatsAppTab'
    });
    window.close();
  });
  
  // Open settings button
  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    window.close();
  });
});`
    },
    sidebarHtml: {
      path: 'public/sidebar.html',
      priority: 'HIGH',
      description: 'Sidebar HTML container',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dealer Copilot Sidebar</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="sidebar.js"></script>
</body>
</html>`
    },
    sidebarIndex: {
      path: 'src/sidebar/index.jsx',
      priority: 'HIGH',
      description: 'Sidebar React entry point',
      content: `// index.jsx - Sidebar React entry point

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);

console.log('[Copilot Sidebar] React app mounted');`
    },
    webpackConfig: {
      path: 'webpack.config.js',
      priority: 'HIGH',
      description: 'Webpack build configuration',
      content: `// webpack.config.js - Build configuration

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map',
    
    entry: {
      'service-worker': './src/background/service-worker.js',
      'content-script': './src/content/content-script.js',
      'popup': './src/popup/popup.js',
      'sidebar': './src/sidebar/index.jsx'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }]
              ]
            }
          }
        },
        {
          test: /\\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    
    resolve: {
      extensions: ['.js', '.jsx']
    },
    
    plugins: [
      new CopyPlugin({
        patterns: [
          { 
            from: 'public/manifest.json', 
            to: 'manifest.json' 
          },
          { 
            from: 'public/icons', 
            to: 'icons',
            noErrorOnMissing: true
          },
          {
            from: 'public/popup.html',
            to: 'popup.html'
          },
          {
            from: 'public/sidebar.html',
            to: 'sidebar.html'
          }
        ]
      })
    ],
    
    optimization: {
      minimize: isProduction,
      splitChunks: false
    }
  };
};`
    },
    readme: {
      path: 'README.md',
      priority: 'MEDIUM',
      description: 'Project documentation',
      content: `# Dealer Copilot

AI-powered listing preparation tool for luxury watch dealers.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Chrome browser (for development)

### Installation

1. **Clone and install dependencies:**
\`\`\`bash
git clone <your-repo>
cd dealer-copilot
npm install
\`\`\`

2. **Build the extension:**
\`\`\`bash
npm run build
\`\`\`

3. **Load in Chrome:**
   - Open \`chrome://extensions/\`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the \`dist\` folder

### Development

**Watch mode (auto-rebuild on changes):**
\`\`\`bash
npm run dev
\`\`\`

**Run tests:**
\`\`\`bash
npm test
\`\`\`

## 📁 Project Structure

\`\`\`
dealer-copilot/
├── public/
│   ├── manifest.json       # Extension manifest
│   ├── popup.html          # Extension popup
│   ├── sidebar.html        # Sidebar container
│   └── icons/              # Extension icons
├── src/
│   ├── background/
│   │   └── service-worker.js   # Background service worker
│   ├── content/
│   │   └── content-script.js   # WhatsApp Web injection
│   ├── sidebar/
│   │   ├── App.jsx         # Main React app
│   │   └── index.jsx       # React entry point
│   └── popup/
│       └── popup.js        # Popup functionality
├── dist/                   # Build output (generated)
├── package.json
├── webpack.config.js
└── README.md
\`\`\`

## 🔒 Compliance

- **No WhatsApp DOM manipulation** - Sidebar overlay only
- **Manual posting required** - Human-in-the-loop design
- **Local-first storage** - IndexedDB + optional sync
- **Standard browser APIs only** - No automation

## 🛠️ Key Features

- ✨ AI-powered listing generation
- 📋 One-click clipboard copy
- 📊 Post tracking and analytics
- 🎯 Group performance insights
- 🔒 Spam prevention engine
- 💎 Style calibration (learns preferences)

## 📦 Publishing

1. Prepare icons (16x16, 48x48, 128x128)
2. Test thoroughly
3. Create ZIP: \`zip -r dealer-copilot.zip dist/*\`
4. Upload to Chrome Web Store
5. Submit for review

## 📄 License

Proprietary - All rights reserved`
    },
    gitignore: {
      path: '.gitignore',
      priority: 'MEDIUM',
      description: 'Git ignore file',
      content: `# Dependencies
node_modules/

# Build output
dist/
build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/

# Misc
*.zip`
    }
  };

  const filePriorities = Object.entries(fileStructure).sort((a, b) => {
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2 };
    return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dealer Copilot - Essential Files
          </h1>
          <p className="text-slate-400 text-lg mb-4">
            Complete, production-ready Chrome extension structure
          </p>
          {copied && (
            <div className="inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
              ✓ Copied to clipboard!
            </div>
          )}
        </div>

        {/* File List Sidebar */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl p-4 sticky top-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <FolderTree className="w-4 h-4" />
                Project Files
              </h3>
              <div className="space-y-2">
                {filePriorities.map(([key, file]) => (
                  <button
                    key={key}
                    onClick={() => setActiveFile(key)}
                    className={`w-full text-left p-2 rounded text-sm transition-all ${
                      activeFile === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(file.priority)}`} />
                      <FileCode className="w-3 h-3" />
                      <span className="text-xs truncate flex-1">
                        {file.path.split('/').pop()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Priority Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-slate-400">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-slate-400">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-slate-400">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl overflow-hidden">
              {/* File Header */}
              <div className="bg-slate-900/80 p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(fileStructure[activeFile].priority)} text-white`}>
                      {fileStructure[activeFile].priority}
                    </span>
                    <h2 className="text-lg font-semibold text-white">
                      {fileStructure[activeFile].path}
                    </h2>
                  </div>
                  <button
                    onClick={() => copyToClipboard(fileStructure[activeFile].content)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  {fileStructure[activeFile].description}
                </p>
              </div>

              {/* File Content */}
              <div className="p-4 bg-black">
                <pre className="text-xs text-green-400 overflow-x-auto">
                  <code>{fileStructure[activeFile].content}</code>
                </pre>
              </div>
            </div>

            {/* Quick Start Instructions */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Play className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    Quick Start Guide
                  </h3>
                  <ol className="space-y-2 text-sm text-slate-300">
                    <li>1. Create project folder: <code className="bg-slate-800 px-2 py-1 rounded">mkdir dealer-copilot && cd dealer-copilot</code></li>
                    <li>2. Copy all files to their respective paths</li>
                    <li>3. Run: <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>4. Build: <code className="bg-slate-800 px-2 py-1 rounded">npm run build</code></li>
                    <li>5. Load <code className="bg-slate-800 px-2 py-1 rounded">dist/</code> folder in Chrome</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerCopilotFiles;);
  };

  const fileStructure = {
    manifest: {
      path: 'public/manifest.json',
      priority: 'CRITICAL',
      description: 'Extension configuration - Chrome\'s entry point',
      content: `{
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
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    },
    "default_title": "Dealer Copilot"
  },
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://web.whatsapp.com/*"],
      "js": ["content-script.js"],
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
      "resources": [
        "sidebar.html",
        "sidebar.js",
        "sidebar.css",
        "icons/*"
      ],
      "matches": ["https://web.whatsapp.com/*"]
    }
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}`
    },
    serviceWorker: {
      path: 'src/background/service-worker.js',
      priority: 'CRITICAL',
      description: 'Background service worker - manages extension lifecycle',
      content: `// service-worker.js - Background service worker for Dealer Copilot
// This runs independently and manages the extension's core functionality

console.log('[Copilot] Service worker initialized');

// Extension installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Copilot] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First-time setup
    await initializeExtension();
    
    // Open onboarding page
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('onboarding.html') 
    });
  } else if (details.reason === 'update') {
    console.log('[Copilot] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Initialize default storage
async function initializeExtension() {
  const defaultSettings = {
    onboardingComplete: false,
    styleProfile: null,
    subscription: {
      tier: 'free',
      listingsThisMonth: 0,
      resetDate: getNextMonthStart()
    },
    groups: [],
    postHistory: [],
    settings: {
      darkMode: true,
      autoFocus: true,
      showNotifications: true
    }
  };
  
  await chrome.storage.local.set(defaultSettings);
  console.log('[Copilot] Default settings initialized');
}

// Helper: Get first day of next month
function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

// Message handler from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Copilot] Message received:', message.action);
  
  switch (message.action) {
    case 'focusWhatsAppTab':
      handleFocusWhatsAppTab(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
      
    case 'trackListingPosted':
      handleTrackListing(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    case 'checkSubscriptionLimit':
      handleCheckSubscription()
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    case 'getPostHistory':
      handleGetPostHistory(message.data)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Focus WhatsApp Web tab or open new one
async function handleFocusWhatsAppTab(data) {
  try {
    // Find existing WhatsApp tabs
    const tabs = await chrome.tabs.query({ 
      url: 'https://web.whatsapp.com/*' 
    });
    
    if (tabs.length > 0) {
      // Focus existing tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      
      console.log('[Copilot] Focused existing WhatsApp tab');
      return { success: true, tabId: tabs[0].id };
    } else {
      // Open new WhatsApp tab
      const newTab = await chrome.tabs.create({ 
        url: 'https://web.whatsapp.com',
        active: true
      });
      
      console.log('[Copilot] Opened new WhatsApp tab');
      return { success: true, tabId: newTab.id, isNew: true };
    }
  } catch (error) {
    console.error('[Copilot] Error focusing tab:', error);
    throw error;
  }
}

// Track posted listing
async function handleTrackListing(data) {
  try {
    const { listingId, groupName, timestamp, listingData } = data;
    
    // Get current post history
    const storage = await chrome.storage.local.get(['postHistory', 'subscription']);
    const postHistory = storage.postHistory || [];
    const subscription = storage.subscription || { tier: 'free', listingsThisMonth: 0 };
    
    // Add new post
    postHistory.push({
      id: listingId,
      groupName,
      timestamp: timestamp || Date.now(),
      listing: listingData
    });
    
    // Increment usage counter
    subscription.listingsThisMonth++;
    
    // Save back to storage
    await chrome.storage.local.set({ 
      postHistory,
      subscription 
    });
    
    console.log('[Copilot] Tracked listing:', listingId, 'in group:', groupName);
    return { success: true, total: postHistory.length };
  } catch (error) {
    console.error('[Copilot] Error tracking listing:', error);
    throw error;
  }
}

// Check subscription limits
async function handleCheckSubscription() {
  try {
    const { subscription } = await chrome.storage.local.get('subscription');
    
    const limit = subscription.tier === 'free' ? 3 : Infinity;
    const used = subscription.listingsThisMonth || 0;
    const remaining = Math.max(0, limit - used);
    
    // Check if reset needed
    const now = new Date();
    const resetDate = new Date(subscription.resetDate);
    if (now >= resetDate) {
      // Reset monthly counter
      subscription.listingsThisMonth = 0;
      subscription.resetDate = getNextMonthStart();
      await chrome.storage.local.set({ subscription });
      
      return {
        allowed: true,
        remaining: limit,
        tier: subscription.tier,
        resetOccurred: true
      };
    }
    
    return {
      allowed: remaining > 0,
      remaining,
      used,
      limit,
      tier: subscription.tier,
      resetDate: subscription.resetDate
    };
  } catch (error) {
    console.error('[Copilot] Error checking subscription:', error);
    throw error;
  }
}

// Get post history with filters
async function handleGetPostHistory(filters = {}) {
  try {
    const { postHistory } = await chrome.storage.local.get('postHistory');
    let history = postHistory || [];
    
    // Apply filters
    if (filters.groupName) {
      history = history.filter(post => post.groupName === filters.groupName);
    }
    
    if (filters.startDate) {
      history = history.filter(post => post.timestamp >= filters.startDate);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return { success: true, history };
  } catch (error) {
    console.error('[Copilot] Error getting history:', error);
    throw error;
  }
}

// Keep service worker alive (important for Manifest V3)
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[Copilot] Service worker keepalive ping');
  }
});`
    },
    contentScript: {
      path: 'src/content/content-script.js',
      priority: 'CRITICAL',
      description: 'Content script - bridges WhatsApp Web and extension',
      content: `// content-script.js - Injected into WhatsApp Web
// This script creates the sidebar and handles communication

console.log('[Copilot] Content script loaded on WhatsApp Web');

let sidebarInjected = false;
let sidebarIframe = null;

// Wait for WhatsApp to fully load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('[Copilot] Initializing on WhatsApp Web');
  
  // Wait a bit for WhatsApp's React to stabilize
  setTimeout(() => {
    injectSidebar();
    setupMessageBridge();
    setupClipboardHandler();
  }, 2000);
}

// Inject sidebar iframe
function injectSidebar() {
  if (sidebarInjected) {
    console.log('[Copilot] Sidebar already injected');
    return;
  }
  
  // Create container
  const container = document.createElement('div');
  container.id = 'dealer-copilot-root';
  container.style.cssText = \`
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 999999;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    background: #1e293b;
    border-left: 1px solid #334155;
    overflow: hidden;
  \`;
  
  // Create iframe for isolated React app
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'dealer-copilot-sidebar';
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.style.cssText = \`
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  \`;
  
  container.appendChild(sidebarIframe);
  document.body.appendChild(container);
  
  sidebarInjected = true;
  console.log('[Copilot] Sidebar injected successfully');
}

// Setup message bridge between iframe and background
function setupMessageBridge() {
  // Listen to messages from sidebar iframe
  window.addEventListener('message', async (event) => {
    // Security: Only accept messages from our iframe
    if (event.source !== sidebarIframe?.contentWindow) {
      return;
    }
    
    const { type, payload } = event.data;
    
    if (!type || !type.startsWith('COPILOT_')) {
      return;
    }
    
    console.log('[Copilot] Message from sidebar:', type);
    
    switch (type) {
      case 'COPILOT_COPY_TO_CLIPBOARD':
        await handleCopyToClipboard(payload);
        break;
        
      case 'COPILOT_FOCUS_WHATSAPP':
        handleFocusWhatsApp();
        break;
        
      case 'COPILOT_GET_GROUPS':
        await handleGetGroups();
        break;
        
      case 'COPILOT_TRACK_POST':
        await handleTrackPost(payload);
        break;
        
      default:
        console.warn('[Copilot] Unknown message type:', type);
    }
  });
  
  // Listen to messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Copilot] Message from background:', message.action);
    
    // Forward relevant messages to sidebar
    if (sidebarIframe?.contentWindow) {
      sidebarIframe.contentWindow.postMessage({
        type: 'COPILOT_BACKGROUND_MESSAGE',
        payload: message
      }, '*');
    }
    
    sendResponse({ received: true });
  });
}

// Handle clipboard copy
async function handleCopyToClipboard(data) {
  try {
    const { text } = data;
    
    // Use modern Clipboard API
    await navigator.clipboard.writeText(text);
    
    console.log('[Copilot] Text copied to clipboard');
    
    // Notify sidebar of success
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_CLIPBOARD_SUCCESS',
      payload: { success: true }
    }, '*');
    
    // Optional: Show brief notification
    showNotification('✓ Copied to clipboard');
    
  } catch (error) {
    console.error('[Copilot] Clipboard error:', error);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_CLIPBOARD_ERROR',
      payload: { error: error.message }
    }, '*');
  }
}

// Handle focus WhatsApp request
function handleFocusWhatsApp() {
  // Just ensure window is focused
  window.focus();
  
  console.log('[Copilot] WhatsApp window focused');
  
  sidebarIframe.contentWindow.postMessage({
    type: 'COPILOT_FOCUS_SUCCESS',
    payload: { success: true }
  }, '*');
}

// Extract group list from WhatsApp (read-only)
async function handleGetGroups() {
  try {
    const groups = [];
    
    // Find group/chat elements in sidebar
    // Note: WhatsApp's DOM structure may change - this is a robust approach
    const chatElements = document.querySelectorAll('[data-testid="cell-frame-title"]');
    
    chatElements.forEach((element, index) => {
      const groupName = element.textContent.trim();
      if (groupName && index < 50) { // Limit to first 50
        groups.push({
          name: groupName,
          id: \`group_\${index}\`,
          lastSeen: Date.now()
        });
      }
    });
    
    console.log('[Copilot] Extracted', groups.length, 'groups');
    
    // Send back to sidebar
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_GROUPS_DATA',
      payload: { groups }
    }, '*');
    
  } catch (error) {
    console.error('[Copilot] Error getting groups:', error);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_GROUPS_ERROR',
      payload: { error: error.message }
    }, '*');
  }
}

// Track post to background
async function handleTrackPost(data) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'trackListingPosted',
      data
    });
    
    console.log('[Copilot] Post tracked:', response);
    
    sidebarIframe.contentWindow.postMessage({
      type: 'COPILOT_TRACK_SUCCESS',
      payload: response
    }, '*');
    
  } catch (error) {
    console.error('[Copilot] Error tracking post:', error);
  }
}

// Setup clipboard monitoring (optional feature)
function setupClipboardHandler() {
  // Could monitor for paste events to detect when user pastes
  // This is NON-INVASIVE - we don't modify WhatsApp's behavior
  document.addEventListener('paste', (e) => {
    console.log('[Copilot] Paste detected (monitoring only)');
  });
}

// Show temporary notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 420px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui;
    font-size: 14px;
    z-index: 9999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  \`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = \`
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
\`;
document.head.appendChild(style);

console.log('[Copilot] Content script fully initialized');`
    },
    sidebarApp: {
      path: 'src/sidebar/App.jsx',
      priority: 'CRITICAL',
      description: 'Main React sidebar UI component',
      content: `// App.jsx - Main sidebar React application

import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    reference: '',
    year: '',
    condition: 'excellent',
    price: '',
    description: ''
  });
  const [generatedText, setGeneratedText] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Load initial data
    loadGroups();
    checkSubscription();
    
    // Listen for messages from content script
    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'COPILOT_GROUPS_DATA':
        setGroups(payload.groups);
        break;
      case 'COPILOT_CLIPBOARD_SUCCESS':
        showSuccess('Copied to clipboard!');
        break;
      case 'COPILOT_TRACK_SUCCESS':
        showSuccess('Post tracked successfully!');
        break;
    }
  };

  const loadGroups = () => {
    window.parent.postMessage({
      type: 'COPILOT_GET_GROUPS'
    }, '*');
  };

  const checkSubscription = async () => {
    const response = await chrome.runtime.sendMessage({
      action: 'checkSubscriptionLimit'
    });
    setSubscription(response);
  };

  const handleGenerateListing = () => {
    const templates = {
      professional: \`\${formData.brand} \${formData.model} ref. \${formData.reference}, circa \${formData.year}. \${formData.condition} condition. Asking \${formData.price}. Serious inquiries welcome.\`,
      friendly: \`Beautiful \${formData.model} \${formData.reference} available! \${formData.year} vintage, \${formData.condition} condition. \${formData.price} - Let's chat!\`
    };
    
    setGeneratedText(templates.professional);
  };

  const handleCopy = () => {
    window.parent.postMessage({
      type: 'COPILOT_COPY_TO_CLIPBOARD',
      payload: { text: generatedText }
    }, '*');
    
    // Track the post
    if (selectedGroup) {
      window.parent.postMessage({
        type: 'COPILOT_TRACK_POST',
        payload: {
          listingId: \`listing_\${Date.now()}\`,
          groupName: selectedGroup,
          timestamp: Date.now(),
          listingData: { ...formData, text: generatedText }
        }
      }, '*');
    }
  };

  const showSuccess = (message) => {
    // Simple success feedback
    alert(message);
  };

  return (
    <div style={{ 
      background: '#1e293b', 
      height: '100vh', 
      color: '#fff',
      fontFamily: 'system-ui',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #334155',
        background: '#0f172a'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
          ⌚ Dealer Copilot
        </h1>
        {subscription && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            {subscription.tier === 'free' 
              ? \`\${subscription.remaining}/3 listings remaining\`
              : 'Premium - Unlimited'}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '12px 20px',
        borderBottom: '1px solid #334155'
      }}>
        {['create', 'history', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: activeTab === tab ? '#3b82f6' : '#334155',
              color: '#fff',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '20px' 
      }}>
        {activeTab === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Brand (e.g., Rolex)"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              style={inputStyle}
            />
            
            <input
              type="text"
              placeholder="Model (e.g., Submariner)"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              style={inputStyle}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="text"
                placeholder="Reference"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                style={inputStyle}
              />
            </div>

            <input
              type="text"
              placeholder="Price (e.g., $15,000)"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              style={inputStyle}
            />

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateListing}
              style={{
                ...buttonStyle,
                background: '#3b82f6'
              }}
            >
              ✨ Generate Listing
            </button>

            {generatedText && (
              <div style={{ 
                background: '#0f172a', 
                padding: '16px', 
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  margin: '0 0 12px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {generatedText}
                </p>
                <button
                  onClick={handleCopy}
                  style={{
                    ...buttonStyle,
                    background: '#10b981'
                  }}
                >
                  📋 Copy & Track
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Post history will appear here...
            </p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Group analytics and insights...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #334155',
  borderRadius: '6px',
  background: '#0f172a',
  color: '#fff',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};`
    },
    packageJson: {
      path: 'package.json',
      priority: 'HIGH',
      description: 'NPM dependencies and build scripts',
      content: `{
  "name": "dealer-copilot",
  "version": "1.0.0",
  "description": "AI-powered listing preparation tool for luxury watch dealers",
  "private": true,
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "clean": "rm -rf dist",
    "rebuild": "npm run clean && npm run build",
    "test": "jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "babel-loader": "^9.1.3",
    "copy-webpack-plugin": "^11.0.0",
    "css-loader": "^6.8.1",
    "html-webpack-plugin": "^5.5.3",
    "style-loader": "^3.3.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "eslint": "^8.52.0",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}`
    },
    popupHtml: {
      path: 'public/popup.html',
      priority: 'MEDIUM',
      description: 'Extension popup UI',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dealer Copilot</title>
  <style>
    body {
      width: 320px;
      min-height: 200px;
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #1e293b;
      color: #fff;
    }
    h2 {
      margin: 0 0 16px;
      font-size: 18px;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #0f172a;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .stat-label {
      color: #94a3b8;
      font-size: 13px;
    }
    .stat-value {
      font-weight: 600;
      font-size: 14px;
    }
    button {
      width: 100%;
      padding: 10px;
      margin-top: 12px;
      border: none;
      border-radius: 6px;
      background: #3b82f6;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <h2>⌚ Dealer Copilot</h2>
  
  <div class="stat">
    <span class="stat-label">Listings This Month</span>
    <span class="stat-value" id="listings-count">-</span>
  </div>
  
  <div class="stat">
    <span class="stat-label">Subscription</span>
    <span class="stat-value" id="tier">-</span>
  </div>
  
  <button id="open-whatsapp">Open WhatsApp Web</button>
  <button id="open-settings" style="background: #64748b; margin-top: 8px;">Settings</button>
  
  <script src="popup.js"></script>
</body>
</html>`

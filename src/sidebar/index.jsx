// index.jsx - React entry point for Dealer Copilot sidebar
// Mounts the main App component to the DOM

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize the React application
function initializeApp() {
  console.log('[Dealer Copilot] Initializing React application...');
  
  // Find the root element where we'll mount our React app
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('[Dealer Copilot] Root element not found! Creating one...');
    
    // Create root element if it doesn't exist (fallback)
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    newRoot.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;
    document.body.appendChild(newRoot);
    
    mountApp(newRoot);
  } else {
    mountApp(rootElement);
  }
}

// Mount the React app to the DOM
function mountApp(container) {
  try {
    // Create React root
    const root = createRoot(container);
    
    // Render the main App component
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('[Dealer Copilot] React application mounted successfully');
    
    // Notify parent window that we're ready
    if (window.parent) {
      window.parent.postMessage({
        type: 'COPILOT_REACT_READY',
        payload: { timestamp: Date.now() }
      }, '*');
    }
    
  } catch (error) {
    console.error('[Dealer Copilot] Failed to mount React app:', error);
    
    // Show error UI
    container.innerHTML = `
      <div style="
        padding: 40px 20px;
        text-align: center;
        color: #ef4444;
        font-family: system-ui, sans-serif;
      ">
        <h2>⚠️ Dealer Copilot Error</h2>
        <p>Failed to load the application. Please refresh the page.</p>
        <small>Error: ${error.message}</small>
        <br>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Add global styles for the React app
function addGlobalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
    }
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    
    /* Focus styles for accessibility */
    :focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* Utility classes */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    /* Loading animation */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .loading-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;
  document.head.appendChild(style);
  console.log('[Dealer Copilot] Global styles added');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addGlobalStyles();
    initializeApp();
  });
} else {
  addGlobalStyles();
  initializeApp();
}

// Export for potential testing or module usage
export { initializeApp, mountApp };

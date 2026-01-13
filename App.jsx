// App.jsx - Main sidebar React application

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
  const [notification, setNotification] = useState(null);

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
        showNotification('✓ Copied to clipboard!', 'success');
        break;
      case 'COPILOT_TRACK_SUCCESS':
        showNotification('✓ Post tracked successfully!', 'success');
        checkSubscription(); // Refresh subscription data
        break;
      case 'COPILOT_CLIPBOARD_ERROR':
        showNotification('Failed to copy', 'error');
        break;
    }
  };

  const loadGroups = () => {
    window.parent.postMessage({
      type: 'COPILOT_GET_GROUPS'
    }, '*');
  };

  const checkSubscription = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkSubscriptionLimit'
      });
      setSubscription(response);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleGenerateListing = () => {
    if (!formData.brand || !formData.model || !formData.price) {
      showNotification('Please fill in brand, model, and price', 'error');
      return;
    }

    // Template-based generation (in production, call AI API)
    const templates = {
      professional: `${formData.brand} ${formData.model}${formData.reference ? ` ref. ${formData.reference}` : ''}${formData.year ? `, circa ${formData.year}` : ''}. ${formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1)} condition. Asking ${formData.price}. Serious inquiries welcome.`,
      friendly: `Beautiful ${formData.model}${formData.reference ? ` ${formData.reference}` : ''} available!${formData.year ? ` ${formData.year} vintage,` : ''} ${formData.condition} condition. ${formData.price} - Let's chat!`,
      minimal: `${formData.brand} ${formData.model}${formData.reference ? ` ${formData.reference}` : ''}\n${formData.year ? `Year: ${formData.year}\n` : ''}Condition: ${formData.condition}\nPrice: ${formData.price}\nDM for details`
    };
    
    setGeneratedText(templates.professional);
    showNotification('✨ Listing generated!', 'success');
  };

  const handleCopy = () => {
    if (!generatedText) return;

    // Check subscription limit
    if (subscription && !subscription.allowed) {
      showNotification(`Free tier limit reached (${subscription.limit}/month). Upgrade to continue.`, 'error');
      return;
    }

    window.parent.postMessage({
      type: 'COPILOT_COPY_TO_CLIPBOARD',
      payload: { text: generatedText }
    }, '*');
    
    // Track the post if group is selected
    if (selectedGroup) {
      window.parent.postMessage({
        type: 'COPILOT_TRACK_POST',
        payload: {
          listingId: `listing_${Date.now()}`,
          groupName: selectedGroup,
          timestamp: Date.now(),
          listingData: { ...formData, text: generatedText }
        }
      }, '*');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div style={{ 
      background: '#1e293b', 
      height: '100vh', 
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          fontSize: '14px',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

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
              ? `${subscription.remaining}/${subscription.limit} listings remaining this month`
              : 'Premium - Unlimited listings'}
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
              textTransform: 'capitalize',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.2s'
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

            <select
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              style={inputStyle}
            >
              <option value="mint">Mint</option>
              <option value="excellent">Excellent</option>
              <option value="very-good">Very Good</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>

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
              <option value="">Select group (optional)...</option>
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
                background: '#3b82f6',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
            >
              ✨ Generate Listing
            </button>

            {generatedText && (
              <div style={{ 
                background: '#0f172a', 
                padding: '16px', 
                borderRadius: '8px',
                marginTop: '12px',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>
                    Generated Listing
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {generatedText.length} chars
                  </span>
                </div>
                <p style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  margin: '0 0 12px',
                  whiteSpace: 'pre-wrap',
                  color: '#e2e8f0'
                }}>
                  {generatedText}
                </p>
                <button
                  onClick={handleCopy}
                  style={{
                    ...buttonStyle,
                    background: '#10b981'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  📋 Copy & Track
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', paddingTop: '40px' }}>
            <p>📜 Post history will appear here...</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Track which groups you've posted to</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', paddingTop: '40px' }}>
            <p>📊 Group analytics coming soon...</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Performance insights per group</p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
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
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s'
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
  transition: 'background 0.2s'
};

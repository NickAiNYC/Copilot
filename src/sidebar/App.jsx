// App.jsx - Main React sidebar application for Dealer Copilot
// The primary UI that dealers interact with on WhatsApp Web

import React, { useState, useEffect, useReducer, createContext, useCallback } from 'react';
import styled from 'styled-components';

// ==================== CONTEXT & REDUCER ====================
export const AppContext = createContext();

const initialState = {
  activeView: 'create', // 'create' | 'history' | 'analytics' | 'settings'
  formData: {
    brand: '',
    model: '',
    reference: '',
    year: '',
    condition: 'excellent',
    price: '',
    currency: 'USD',
    location: '',
    description: '',
    photos: []
  },
  generatedText: '',
  groups: [],
  selectedGroups: [],
  subscription: null,
  postHistory: [],
  isLoading: false,
  lastCopiedAt: null,
  sidebarVisible: true
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    
    case 'UPDATE_FORM':
      return { 
        ...state, 
        formData: { ...state.formData, ...action.payload } 
      };
    
    case 'SET_GENERATED_TEXT':
      return { ...state, generatedText: action.payload };
    
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    
    case 'TOGGLE_GROUP':
      const groupName = action.payload;
      const isSelected = state.selectedGroups.includes(groupName);
      return {
        ...state,
        selectedGroups: isSelected
          ? state.selectedGroups.filter(g => g !== groupName)
          : [...state.selectedGroups, groupName]
      };
    
    case 'SELECT_ALL_GROUPS':
      return {
        ...state,
        selectedGroups: state.groups.map(g => g.name)
      };
    
    case 'DESELECT_ALL_GROUPS':
      return { ...state, selectedGroups: [] };
    
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    
    case 'SET_POST_HISTORY':
      return { ...state, postHistory: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_LAST_COPIED':
      return { ...state, lastCopiedAt: action.payload };
    
    case 'SET_SIDEBAR_VISIBLE':
      return { ...state, sidebarVisible: action.payload };
    
    case 'RESET_FORM':
      return { 
        ...state, 
        formData: initialState.formData,
        generatedText: '',
        selectedGroups: [] 
      };
    
    default:
      return state;
  }
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [notifications, setNotifications] = useState([]);
  const [styleProfile, setStyleProfile] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Listen for messages from content script
    const handleMessage = (event) => {
      const { type, payload } = event.data || {};
      
      switch (type) {
        case 'COPILOT_GROUPS_DATA':
          dispatch({ type: 'SET_GROUPS', payload: payload.groups });
          break;
        
        case 'COPILOT_CLIPBOARD_SUCCESS':
          dispatch({ type: 'SET_LAST_COPIED', payload: Date.now() });
          showNotification('✅ Copied to clipboard!', 'success');
          break;
        
        case 'COPILOT_CLIPBOARD_ERROR':
          showNotification(`❌ Copy failed: ${payload.error}`, 'error');
          break;
        
        case 'COPILOT_TRACK_SUCCESS':
          showNotification('📊 Post tracked successfully!', 'success');
          break;
        
        case 'COPILOT_SIDEBAR_VISIBILITY':
          dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: payload.visible });
          break;
        
        case 'COPILOT_BACKGROUND_MESSAGE':
          handleBackgroundMessage(payload);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Initial load
    loadInitialData();
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // ==================== CORE FUNCTIONS ====================
  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load groups
      requestGroups();
      
      // Load subscription
      const subscription = await requestSubscription();
      if (subscription) {
        dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
      }
      
      // Load style profile (if any)
      const profile = await loadStyleProfile();
      if (profile) setStyleProfile(profile);
      
    } catch (error) {
      showNotification(`Failed to load data: ${error.message}`, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const requestGroups = () => {
    window.parent.postMessage({
      type: 'COPILOT_GET_GROUPS'
    }, '*');
  };

  const requestSubscription = async () => {
    try {
      // This would typically call chrome.runtime.sendMessage
      // For now, return mock data
      return {
        tier: 'free',
        listingsThisMonth: 0,
        remaining: 3,
        limit: 3,
        trialEnds: null
      };
    } catch (error) {
      console.error('Subscription check failed:', error);
      return null;
    }
  };

  const loadStyleProfile = async () => {
    // Load from localStorage or IndexedDB
    const saved = localStorage.getItem('dealerCopilot_styleProfile');
    return saved ? JSON.parse(saved) : null;
  };

  const handleBackgroundMessage = (message) => {
    switch (message.action) {
      case 'subscriptionUpdated':
        dispatch({ type: 'SET_SUBSCRIPTION', payload: message.data });
        break;
    }
  };

  // ==================== LISTING GENERATION ====================
  const generateListing = () => {
    const { brand, model, reference, year, condition, price, currency, location } = state.formData;
    
    if (!brand || !model || !price) {
      showNotification('Please fill in brand, model, and price', 'warning');
      return;
    }

    const templates = {
      professional: `⌚ ${brand} ${model} ${reference ? `Ref: ${reference}` : ''}
📍 ${location || 'Location available upon request'}

📅 Year: ${year || 'N/A'}
🔧 Condition: ${condition}
💰 Price: ${currency}${price}

📦 Complete set with box & papers
✅ Authenticity guaranteed
📞 Serious inquiries only - DM for details`,
      
      concise: `🔥 ${brand} ${model} ${reference ? `(${reference})` : ''}
${year ? `${year} • ` : ''}${condition} condition
$${price} ${currency}

DM for more info/photos`,
      
      detailed: `**${brand} ${model}** ${reference ? `- Reference ${reference}` : ''}
▫️ Year: ${year || 'N/A'}
▫️ Condition: ${condition}
▫️ Price: ${currency}${price}
▫️ Location: ${location || 'Available worldwide'}

📋 Includes: Box, papers, warranty card
🔍 Authenticity: 100% guaranteed
🚚 Shipping: Worldwide insured

💬 Please message for:
• Additional photos/videos
• Service history
• Price negotiation
• Shipping quotes`
    };

    const style = styleProfile?.preferredStyle || 'professional';
    const generated = templates[style] || templates.professional;
    
    // Apply compliance rules (simple version)
    const compliantText = generated
      .replace(/URGENT|HURRY|ACT NOW/gi, 'Available')
      .replace(/!!!{2,}/g, '!')
      .replace(/\n{4,}/g, '\n\n');
    
    dispatch({ type: 'SET_GENERATED_TEXT', payload: compliantText });
    showNotification('✨ Listing generated!', 'success');
  };

  const copyToClipboard = async () => {
    if (!state.generatedText) {
      showNotification('Please generate a listing first', 'warning');
      return;
    }

    if (state.selectedGroups.length === 0) {
      showNotification('Please select at least one group', 'warning');
      return;
    }

    // Check subscription limits
    if (state.subscription && !state.subscription.allowed && state.subscription.tier === 'free') {
      showNotification('Free tier limit reached. Upgrade to continue.', 'error');
      return;
    }

    try {
      const listingId = `listing_${Date.now()}`;
      
      // Prepare text with group tags if multiple groups selected
      let finalText = state.generatedText;
      if (state.selectedGroups.length > 1) {
        finalText += `\n\n👥 Posting to: ${state.selectedGroups.join(', ')}`;
      } else if (state.selectedGroups.length === 1) {
        finalText += `\n\n👥 ${state.selectedGroups[0]}`;
      }

      // Send to content script for clipboard copy
      window.parent.postMessage({
        type: 'COPILOT_COPY_TO_CLIPBOARD',
        payload: {
          text: finalText,
          listingId,
          groupName: state.selectedGroups.join(', '),
          listingData: state.formData
        }
      }, '*');

      // Track in local history
      const newHistory = [
        {
          id: listingId,
          timestamp: Date.now(),
          groups: state.selectedGroups,
          listing: state.formData,
          textPreview: state.generatedText.substring(0, 100) + '...'
        },
        ...state.postHistory
      ];
      dispatch({ type: 'SET_POST_HISTORY', payload: newHistory.slice(0, 50) });

    } catch (error) {
      showNotification(`Copy failed: ${error.message}`, 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const focusWhatsApp = () => {
    window.parent.postMessage({
      type: 'COPILOT_FOCUS_WHATSAPP'
    }, '*');
  };

  // ==================== RENDER HELPERS ====================
  const renderCreateView = () => (
    <CreateContainer>
      <Section>
        <SectionTitle>📝 Watch Details</SectionTitle>
        <FormGrid>
          <Input
            placeholder="Brand (Rolex, Patek, etc.)"
            value={state.formData.brand}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { brand: e.target.value } })}
          />
          <Input
            placeholder="Model (Submariner, Nautilus, etc.)"
            value={state.formData.model}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { model: e.target.value } })}
          />
          <Input
            placeholder="Reference Number"
            value={state.formData.reference}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { reference: e.target.value } })}
          />
          <Input
            placeholder="Year"
            value={state.formData.year}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { year: e.target.value } })}
          />
          
          <Select
            value={state.formData.condition}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { condition: e.target.value } })}
          >
            <option value="new">New/Unworn</option>
            <option value="excellent">Excellent</option>
            <option value="very-good">Very Good</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </Select>
          
          <PriceContainer>
            <CurrencySelect
              value={state.formData.currency}
              onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { currency: e.target.value } })}
            >
              <option value="USD">$</option>
              <option value="EUR">€</option>
              <option value="GBP">£</option>
              <option value="CHF">CHF</option>
            </CurrencySelect>
            <PriceInput
              placeholder="Price"
              value={state.formData.price}
              onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { price: e.target.value } })}
            />
          </PriceContainer>
          
          <Input
            placeholder="Location (optional)"
            value={state.formData.location}
            onChange={(e) => dispatch({ type: 'UPDATE_FORM', payload: { location: e.target.value } })}
          />
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>👥 Select Groups</SectionTitle>
        <GroupsContainer>
          <GroupActions>
            <SmallButton onClick={() => dispatch({ type: 'SELECT_ALL_GROUPS' })}>
              Select All
            </SmallButton>
            <SmallButton onClick={() => dispatch({ type: 'DESELECT_ALL_GROUPS' })}>
              Deselect All
            </SmallButton>
            <SmallButton onClick={requestGroups}>
              ↻ Refresh
            </SmallButton>
          </GroupActions>
          
          <GroupsList>
            {state.groups.length === 0 ? (
              <EmptyState>No groups found. Make sure you're logged into WhatsApp.</EmptyState>
            ) : (
              state.groups.slice(0, 15).map(group => (
                <GroupItem
                  key={group.id}
                  selected={state.selectedGroups.includes(group.name)}
                  onClick={() => dispatch({ type: 'TOGGLE_GROUP', payload: group.name })}
                >
                  <GroupCheckbox selected={state.selectedGroups.includes(group.name)}>
                    {state.selectedGroups.includes(group.name) ? '✓' : ''}
                  </GroupCheckbox>
                  <GroupName>{group.name}</GroupName>
                </GroupItem>
              ))
            )}
          </GroupsList>
          
          {state.selectedGroups.length > 0 && (
            <SelectedCount>
              Selected: {state.selectedGroups.length} group{state.selectedGroups.length !== 1 ? 's' : ''}
            </SelectedCount>
          )}
        </GroupsContainer>
      </Section>

      <ActionButtons>
        <GenerateButton onClick={generateListing} disabled={state.isLoading}>
          {state.isLoading ? 'Generating...' : '✨ Generate Listing'}
        </GenerateButton>
      </ActionButtons>

      {state.generatedText && (
        <Section>
          <SectionTitle>📋 Generated Listing</SectionTitle>
          <PreviewBox>
            <PreviewText>{state.generatedText}</PreviewText>
            <CopyButton onClick={copyToClipboard} disabled={state.selectedGroups.length === 0}>
              📋 Copy & Post to {state.selectedGroups.length} Group{state.selectedGroups.length !== 1 ? 's' : ''}
            </CopyButton>
          </PreviewBox>
        </Section>
      )}
    </CreateContainer>
  );

  const renderHistoryView = () => (
    <HistoryContainer>
      <SectionTitle>📜 Post History</SectionTitle>
      {state.postHistory.length === 0 ? (
        <EmptyState>No posts yet. Create and copy your first listing!</EmptyState>
      ) : (
        <HistoryList>
          {state.postHistory.slice(0, 10).map(post => (
            <HistoryItem key={post.id}>
              <HistoryTime>{new Date(post.timestamp).toLocaleTimeString()}</HistoryTime>
              <HistoryDetails>
                <strong>{post.listing.brand} {post.listing.model}</strong>
                <small>to {post.groups.join(', ')}</small>
              </HistoryDetails>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </HistoryContainer>
  );

  const renderAnalyticsView = () => (
    <AnalyticsContainer>
      <SectionTitle>📊 Analytics</SectionTitle>
      {state.subscription && (
        <StatsGrid>
          <StatCard>
            <StatValue>{state.subscription.tier === 'free' ? 'Free' : 'Premium'}</StatValue>
            <StatLabel>Subscription</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{state.subscription.used || 0}/{state.subscription.limit === Infinity ? '∞' : state.subscription.limit}</StatValue>
            <StatLabel>Listings This Month</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{state.postHistory.length}</StatValue>
            <StatLabel>Total Posts</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{state.groups.length}</StatValue>
            <StatLabel>Groups Found</StatLabel>
          </StatCard>
        </StatsGrid>
      )}
      <EmptyState>Advanced analytics coming soon!</EmptyState>
    </AnalyticsContainer>
  );

  const renderSettingsView = () => (
    <SettingsContainer>
      <SectionTitle>⚙️ Settings</SectionTitle>
      <SettingItem>
        <SettingLabel>Style Preference</SettingLabel>
        <Select defaultValue="professional">
          <option value="professional">Professional</option>
          <option value="concise">Concise</option>
          <option value="detailed">Detailed</option>
        </Select>
      </SettingItem>
      <SettingItem>
        <SettingLabel>Auto-refresh Groups</SettingLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked />
          <span></span>
        </ToggleSwitch>
      </SettingItem>
      <SettingItem>
        <SettingLabel>Show Notifications</SettingLabel>
        <ToggleSwitch>
          <input type="checkbox" defaultChecked />
          <span></span>
        </ToggleSwitch>
      </SettingItem>
      <ActionButtons>
        <Button onClick={() => dispatch({ type: 'RESET_FORM' })}>
          Reset All Data
        </Button>
      </ActionButtons>
    </SettingsContainer>
  );

  // ==================== MAIN RENDER ====================
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <AppContainer>
        {/* Header */}
        <Header>
          <HeaderTitle>
            <WatchEmoji>⌚</WatchEmoji>
            <TitleText>Dealer Copilot</TitleText>
            {state.subscription && (
              <SubscriptionBadge tier={state.subscription.tier}>
                {state.subscription.tier === 'free' ? 'FREE' : 'PRO'}
              </SubscriptionBadge>
            )}
          </HeaderTitle>
          <HeaderSubtitle>
            AI-powered WhatsApp listings for luxury watches
          </HeaderSubtitle>
        </Header>

        {/* Navigation */}
        <Navigation>
          {['create', 'history', 'analytics', 'settings'].map(tab => (
            <NavButton
              key={tab}
              active={state.activeView === tab}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: tab })}
            >
              {tab === 'create' && '📝 Create'}
              {tab === 'history' && '📜 History'}
              {tab === 'analytics' && '📊 Analytics'}
              {tab === 'settings' && '⚙️ Settings'}
            </NavButton>
          ))}
        </Navigation>

        {/* Main Content */}
        <MainContent>
          {state.activeView === 'create' && renderCreateView()}
          {state.activeView === 'history' && renderHistoryView()}
          {state.activeView === 'analytics' && renderAnalyticsView()}
          {state.activeView === 'settings' && renderSettingsView()}
        </MainContent>

        {/* Notifications */}
        <NotificationContainer>
          {notifications.map(notification => (
            <Notification key={notification.id} type={notification.type}>
              {notification.message}
            </Notification>
          ))}
        </NotificationContainer>

        {/* Footer */}
        <Footer>
          <FooterText>
            {state.subscription?.tier === 'free' && (
              <>Free tier: {state.subscription.remaining} listings remaining</>
            )}
            {state.subscription?.tier !== 'free' && (
              <>Premium: Unlimited listings</>
            )}
          </FooterText>
          <FocusButton onClick={focusWhatsApp}>
            🔍 Focus WhatsApp
          </FocusButton>
        </Footer>
      </AppContainer>
    </AppContext.Provider>
  );
}

// ==================== STYLED COMPONENTS ====================
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
`;

const Header = styled.header`
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 1px solid #334155;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;

const WatchEmoji = styled.span`
  font-size: 24px;
`;

const TitleText = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubscriptionBadge = styled.span`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.tier === 'free' ? '#10b981' : '#f59e0b'};
  color: white;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
`;

const Navigation = styled.nav`
  display: flex;
  padding: 0 20px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
`;

const NavButton = styled.button`
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#94a3b8'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#3b82f6' : '#1e293b'};
    color: white;
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const CreateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #f3f4f6;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #f3f4f6;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  gap: 8px;
  grid-column: span 2;
`;

const CurrencySelect = styled.select`
  padding: 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #f3f4f6;
  min-width: 60px;
  cursor: pointer;
`;

const PriceInput = styled(Input)`
  flex: 1;
`;

const GroupsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #334155;
    color: white;
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
`;

const GroupItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${props => props.selected ? '#1e3a8a' : '#0f172a'};
  border: 1px solid ${props => props.selected ? '#3b82f6' : '#334155'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.selected ? '#1e40af' : '#1e293b'};
  }
`;

const GroupCheckbox = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: ${props => props.selected ? '#3b82f6' : '#334155'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const GroupName = styled.span`
  flex: 1;
  font-size: 13px;
  color: ${props => props.selected ? 'white' : '#cbd5e1'};
`;

const SelectedCount = styled.div`
  padding: 8px 12px;
  background: #0f766e;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GenerateButton = styled(Button)`
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  
  &:hover {
    background: linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%);
  }
`;

const PreviewBox = styled.div`
  padding: 16px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PreviewText = styled.pre`
  margin: 0;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #cbd5e1;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: #1e293b;
  border-radius: 4px;
`;

const CopyButton = styled(Button)`
  background: #10b981;
  
  &:hover {
    background: #059669;
  }
`;

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  padding: 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HistoryTime = styled.span`
  font-size: 12px;
  color: #94a3b8;
  min-width: 60px;
`;

const HistoryDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  strong {
    font-size: 14px;
    color: #e2e8f0;
  }
  
  small {
    font-size: 12px;
    color: #94a3b8;
  }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatCard = styled.div`
  padding: 16px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
`;

const SettingLabel = styled.span`
  font-size: 14px;
  color: #e2e8f0;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #334155;
    transition: .4s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #10b981;
  }
  
  input:checked + span:before {
    transform: translateX(20px);
  }
`;

const EmptyState = styled.div`
  padding: 32px 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
`;

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 70px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
`;

const Notification = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background: ${props => 
    props.type === 'success' ? '#10b981' :
    props.type === 'error' ? '#ef4444' :
    props.type === 'warning' ? '#f59e0b' :
    '#3b82f6'
  };
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const Footer = styled.footer`
  padding: 12px 20px;
  background: #0f172a;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterText = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const FocusButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #334155;
    color: white;
  }
`;

export default App;

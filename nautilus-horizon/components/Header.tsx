
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import UserSwitcher from './UserSwitcher';
import LoginModal from './LoginModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Header: React.FC = () => {
  const [euaPrice, setEuaPrice] = useState(76.0);
  const [euaSource, setEuaSource] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  const fetchEuaPrice = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trading/api/market/eua`, {
        credentials: 'include' // K8s-ready: Cookie-based auth
      });
      if (response.ok) {
        const data = await response.json();
        setEuaPrice(parseFloat(data.data.price));
        setEuaSource(data.data.source);
      }
    } catch (error) {
      console.error('Error fetching EUA price for header:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEuaPrice();
    
    // Update every 60 seconds (matching Dashboard and Trading Opportunities pages)
    const interval = setInterval(fetchEuaPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/rfq-board':
        return 'RFQ Board';
      case '/scenario-pad':
        return 'Scenario Pad';
      case '/voyages':
        return 'Voyages';
      case '/compliance-monitoring':
        return 'Compliance Monitoring';
      case '/crew/tasks':
        return 'Crew Tasks';
      case '/crew/league':
        return 'Crew League';
      case '/engine-status':
        return 'Engine Status';
      case '/maintenance':
        return 'Maintenance';
      case '/fleet-management':
        return 'Fleet Management';
      case '/trading-opportunities':
        return 'Trading Opportunities';
      case '/market-data':
        return 'Market Data';
      case '/portfolio':
        return 'Portfolio';
      case '/user-management':
        return 'User Management';
      case '/system-settings':
        return 'System Settings';
      case '/fuel-consumption':
        return 'Fuel Consumption';
      case '/fuel-logging':
        return 'Fuel Logging';
      case '/waste-heat-recovery':
        return 'Waste Heat Recovery';
      case '/profile-settings':
        return 'Profile Settings';
      case '/verification':
        return 'Verification';
      case '/regulatory-deadlines':
        return 'Regulatory Deadlines';
      default:
        return 'Nautilus Horizon';
    }
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #FF6A00, #FF8C42)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚢 Nautilus Horizon
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-muted)', 
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {getPageTitle()}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '8px 16px', 
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: euaSource.includes('FREE') || euaSource.includes('ALPHAVANTAGE') ? '#10B981' : '#FF6A00', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>EUA Price:</span>
          </div>
          <span style={{ 
            color: '#FF6A00', 
            fontWeight: 'bold', 
            fontSize: '16px',
            fontFamily: 'monospace'
          }}>
            €{euaPrice.toFixed(2)}
          </span>
          {euaSource && (
            <span style={{
              fontSize: '10px',
              backgroundColor: euaSource.includes('FREE') || euaSource.includes('ALPHAVANTAGE') ? '#10B981' : '#FF6A00',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              {euaSource}
            </span>
          )}
        </div>
        
        <UserSwitcher />
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};

export default Header;

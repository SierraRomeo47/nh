// Enhanced Professional Maritime Dashboard

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

// Enhanced Dashboard Component
const EnhancedDashboard: React.FC = () => {
  const [euaPrice, setEuaPrice] = useState(75.19);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setEuaPrice(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', active: true },
    { id: 'voyages', label: 'Voyages', icon: '🌍', active: false },
    { id: 'compliance', label: 'Compliance', icon: '📋', active: false },
    { id: 'trading', label: 'Trading', icon: '💰', active: false },
    { id: 'fleet', label: 'Fleet', icon: '🚢', active: false },
    { id: 'reports', label: 'Reports', icon: '📈', active: false },
    { id: 'settings', label: 'Settings', icon: '⚙️', active: false }
  ];

  const fleetData = [
    { name: 'MV Neptune', status: 'Active', compliance: 'Compliant', fuel: 'MGO', efficiency: 94.2 },
    { name: 'MV Poseidon', status: 'Active', compliance: 'Non-Compliant', fuel: 'HFO', efficiency: 89.1 },
    { name: 'MV Triton', status: 'Maintenance', compliance: 'Pending', fuel: 'LNG', efficiency: 96.8 },
    { name: 'MV Atlas', status: 'Active', compliance: 'Compliant', fuel: 'MGO', efficiency: 92.5 }
  ];

  const recentActivities = [
    { type: 'fuel', message: 'MV Neptune - Fuel consumption logged', details: '45.2 tonnes MGO • 2 hours ago', status: 'success' },
    { type: 'compliance', message: 'EU ETS deadline approaching', details: 'Surrender deadline in 15 days • 4 hours ago', status: 'warning' },
    { type: 'trading', message: 'New RFQ posted', details: '500 tCO₂e surplus available • 6 hours ago', status: 'info' },
    { type: 'maintenance', message: 'MV Triton - Engine maintenance completed', details: 'All systems operational • 8 hours ago', status: 'success' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0A0A0A', 
      color: 'white', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Enhanced Header */}
      <header style={{ 
        backgroundColor: '#111111', 
        borderBottom: '1px solid #2A2A2A',
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
            color: '#888', 
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Maritime Compliance Platform
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            backgroundColor: '#1A1A1A', 
            padding: '8px 16px', 
            borderRadius: '8px',
            border: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#10B981', 
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: '#CCC', fontSize: '14px' }}>EUA Price:</span>
            <span style={{ 
              color: '#FF6A00', 
              fontWeight: 'bold', 
              fontSize: '16px',
              fontFamily: 'monospace'
            }}>
              €{euaPrice.toFixed(2)}
            </span>
          </div>
          
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#FF6A00', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>R</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Enhanced Sidebar */}
        <nav style={{ 
          width: '280px', 
          backgroundColor: '#111111', 
          borderRight: '1px solid #2A2A2A',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            color: '#666', 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            padding: '0 24px 16px 24px',
            fontWeight: '600'
          }}>
            Navigation
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: 'none',
                  backgroundColor: activeTab === item.id ? '#FF6A00' : 'transparent',
                  color: activeTab === item.id ? 'white' : '#CCC',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
                {activeTab === item.id && (
                  <div style={{ 
                    marginLeft: 'auto',
                    width: '4px',
                    height: '4px',
                    backgroundColor: 'white',
                    borderRadius: '50%'
                  }}></div>
                )}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div style={{ 
            marginTop: 'auto', 
            padding: '24px 16px 0 16px',
            borderTop: '1px solid #2A2A2A'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              backgroundColor: '#1A1A1A',
              borderRadius: '8px'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: '#FF6A00', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>RB</span>
              </div>
              <div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  Robert Brown
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  Compliance Officer
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Enhanced Main Content */}
        <main style={{ flex: 1, padding: '32px', backgroundColor: '#0A0A0A' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '8px',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Maritime Compliance Dashboard
            </h1>
            <p style={{ 
              color: '#888', 
              fontSize: '16px', 
              margin: 0,
              fontWeight: '400'
            }}>
              Real-time monitoring and management of your maritime compliance operations
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Fleet Overview Card */}
            <div style={{ 
              backgroundColor: '#111111', 
              border: '1px solid #2A2A2A', 
              borderRadius: '12px', 
              padding: '24px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6A00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'white', 
                  margin: 0
                }}>
                  Fleet Overview
                </h3>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#FF6A00', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '16px' }}>🚢</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Active Vessels</span>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>12</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Compliant Vessels</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '18px' }}>10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Non-Compliant</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '18px' }}>2</span>
                </div>
                <div style={{ 
                  height: '4px', 
                  backgroundColor: '#2A2A2A', 
                  borderRadius: '2px',
                  marginTop: '8px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: '#10B981', 
                    borderRadius: '2px',
                    width: '83%'
                  }}></div>
                </div>
              </div>
            </div>

            {/* EU ETS Status Card */}
            <div style={{ 
              backgroundColor: '#111111', 
              border: '1px solid #2A2A2A', 
              borderRadius: '12px', 
              padding: '24px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6A00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'white', 
                  margin: 0
                }}>
                  EU ETS Status
                </h3>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#3B82F6', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '16px' }}>🌍</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Total Exposure</span>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>2,739 tCO₂</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>EUA Price</span>
                  <span style={{ color: '#FF6A00', fontWeight: 'bold', fontSize: '18px' }}>€{euaPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Total Cost</span>
                  <span style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '18px' }}>€207,000</span>
                </div>
                <div style={{ 
                  height: '4px', 
                  backgroundColor: '#2A2A2A', 
                  borderRadius: '2px',
                  marginTop: '8px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: '#F59E0B', 
                    borderRadius: '2px',
                    width: '65%'
                  }}></div>
                </div>
              </div>
            </div>

            {/* FuelEU Status Card */}
            <div style={{ 
              backgroundColor: '#111111', 
              border: '1px solid #2A2A2A', 
              borderRadius: '12px', 
              padding: '24px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF6A00';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2A2A2A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'white', 
                  margin: 0
                }}>
                  FuelEU Status
                </h3>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#10B981', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Surplus Vessels</span>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '18px' }}>2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Deficit Vessels</span>
                  <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '18px' }}>5</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#CCC', fontSize: '14px' }}>Pooling Status</span>
                  <span style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '18px' }}>Active</span>
                </div>
                <div style={{ 
                  height: '4px', 
                  backgroundColor: '#2A2A2A', 
                  borderRadius: '2px',
                  marginTop: '8px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: '#3B82F6', 
                    borderRadius: '2px',
                    width: '100%'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div style={{ 
            backgroundColor: '#111111', 
            border: '1px solid #2A2A2A', 
            borderRadius: '12px', 
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'white', 
                margin: 0
              }}>
                Recent Activity
              </h3>
              <button style={{
                backgroundColor: '#FF6A00',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55A00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6A00';
              }}
              >
                View All
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivities.map((activity, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  backgroundColor: '#1A1A1A', 
                  borderRadius: '8px',
                  border: '1px solid #2A2A2A',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF6A00';
                  e.currentTarget.style.backgroundColor = '#222';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                }}
                >
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: activity.status === 'success' ? '#10B981' : 
                                   activity.status === 'warning' ? '#F59E0B' : '#3B82F6', 
                    borderRadius: '50%',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                      {activity.message}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      {activity.details}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '20px',
                    opacity: 0.5
                  }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
          </Routes>
        </HashRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;



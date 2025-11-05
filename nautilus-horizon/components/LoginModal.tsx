import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      window.location.hash = '#/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0
          }}>
            Sign In
          </h1>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '28px',
              cursor: 'pointer',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-primary)', 
                color: 'var(--text-primary)',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF6A00';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-primary)', 
                color: 'var(--text-primary)',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF6A00';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#DC2626', 
              fontSize: '14px',
              padding: '12px',
              backgroundColor: '#DC262620',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #DC262640'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: loading ? '#666' : '#FF6A00', 
              border: 'none', 
              borderRadius: '8px', 
              color: 'white', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#FF8C42';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#FF6A00';
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ 
            color: 'var(--text-muted)', 
            fontSize: '12px', 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            Demo: Use "password" for all demo users
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;


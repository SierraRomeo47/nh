import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
  const { login, user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('sumit.redu@poseidon.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <form onSubmit={handleSubmit} style={{ background: '#111', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #2A2A2A' }}>
        <h1 style={{ color: 'white', marginBottom: '16px', fontSize: '20px' }}>Sign in</h1>
        <label style={{ color: '#ccc', fontSize: '12px' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #333', background: '#1A1A1A', color: 'white', marginTop: '6px', marginBottom: '12px' }}
        />
        <label style={{ color: '#ccc', fontSize: '12px' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #333', background: '#1A1A1A', color: 'white', marginTop: '6px', marginBottom: '16px' }}
        />
        {error && <div style={{ color: '#ff6a00', marginBottom: '12px' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 12px', background: '#FF6A00', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <div style={{ color: '#888', fontSize: '12px', marginTop: '12px' }}>Tip: Use password "password" for demo users.</div>
      </form>
    </div>
  );
};

export default Login;

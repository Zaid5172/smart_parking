'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Set cookie and localStorage
        const userObj = {
          user_id: data.user.user_id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'Customer'
        };

        localStorage.setItem('user', JSON.stringify(userObj));
        document.cookie = `user_role=${userObj.role}; path=/; max-age=86400`;

        // Notify Navbar immediately
        window.dispatchEvent(new Event('auth-change'));

        // Role-based redirection
        if (userObj.role === 'Admin') {
          router.push('/analytics');
        } else if (userObj.role === 'Staff') {
          router.push('/staff/incidents');
        } else {
          router.push('/parking');
        }
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Service unavailable. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '1rem' }}>
      <div style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#64748b', fontWeight: '600' }}>
          WELCOME TO PARKWISE
        </p>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 1rem 0', color: '#0f172a' }}>
          Good parking starts here.
        </h2>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.25rem', marginBottom: 0 }}>
  New to ParkWise?{' '}
  <a href="/register" style={{ color: '#166534', fontWeight: '600', textDecoration: 'none' }}>
    Create an account
  </a>
</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#166534',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
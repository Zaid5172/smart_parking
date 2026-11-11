'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const syncUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('auth-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleSignOut = () => {
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
    router.refresh();
  };

  const role = user?.role;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: '#0f172a',
      color: '#ffffff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none' }}>
          ParkWise
        </Link>

        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.95rem', alignItems: 'center' }}>
          {/* Public / Common Access */}
          <Link href="/parking" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
            Find Parking
          </Link>

          <Link href="/incidents" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
            Incidents Log
          </Link>

          {/* CUSTOMER ONLY Link */}
          {role === 'Customer' && (
            <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600' }}>
              My Profile
            </Link>
          )}

          {/* STAFF & ADMIN Link */}
          {(role === 'Staff' || role === 'Admin') && (
            <Link href="/staff/incidents" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '600' }}>
              Staff Queue
            </Link>
          )}

          {/* ADMIN ONLY Link */}
          {role === 'Admin' && (
            <Link href="/analytics" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
              📊 Analytics & Revenue
            </Link>
          )}
        </div>
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.35rem 0.75rem', borderRadius: '12px' }}>
              {user.name || user.email} (<strong>{role}</strong>)
            </span>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: '#166534',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        fetchBookings(parsed);
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookings = async (userData) => {
    try {
      const query = userData.user_id
        ? `user_id=${userData.user_id}`
        : `user_name=${encodeURIComponent(userData.name || '')}`;
      const res = await fetch(`/api/bookings?${query}`);
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Please sign in to view your profile and booking history.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
        ACCOUNT OVERVIEW
      </p>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.5rem 0' }}>
        My Profile
      </h1>

      {/* User Details Card */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0.25rem 0 0 0' }}>{user.name || 'Customer User'}</p>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', margin: '0.25rem 0 0 0' }}>{user.email || 'customer@parking.local'}</p>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Role</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#166534', margin: '0.25rem 0 0 0' }}>{user.role || 'Customer'}</p>
        </div>
      </div>

      {/* Booking History Section */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Booking History
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Your past and active parking reservations
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: '#64748b', padding: '1rem 0' }}>No bookings found yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem' }}>Space</th>
                  <th style={{ padding: '0.75rem' }}>Vehicle</th>
                  <th style={{ padding: '0.75rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={b.booking_id || b.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#0f172a' }}>
                      #{b.booking_id || b.id || idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{b.slot_number || b.space_code || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>{b.vehicle_number || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>
                      {formatDate(b.created_at || b.start_time || b.booking_date)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          background: b.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                          color: b.status === 'Active' ? '#166534' : '#475569',
                        }}
                      >
                        {b.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
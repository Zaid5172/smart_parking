'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to load analytics.');
      }
    } catch (err) {
      setError('Could not connect to analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem', color: '#64748b' }}>
        Loading live analytics...
      </div>
    );
  }

  const totalSlots = stats?.totalSlots ?? 0;
  const availableSlots = stats?.availableSlots ?? 0;
  const occupiedSlots = stats?.occupiedSlots ?? 0;
  const occupancyRate = stats?.occupancyRate ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const openIncidents = stats?.openIncidents ?? 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
        OPERATIONS INSIGHT
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            See the bigger picture.
          </h1>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0' }}>
            Dynamic occupancy and recorded parking revenue across {totalSlots} slots.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{ padding: '0.6rem 1.15rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          Refresh analytics
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Recorded Revenue</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#166534', margin: '0.5rem 0 0.25rem 0' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Simulated payments · {totalBookings} reservations</span>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Capacity</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
            {totalSlots} Slots
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: '600' }}>
            {availableSlots} available · {occupiedSlots} occupied
          </span>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Live Occupancy</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
            {occupiedSlots} / {totalSlots} ({occupancyRate}%)
          </h2>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${occupancyRate}%`, height: '100%', background: '#166534', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Open Incidents</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: openIncidents > 0 ? '#b91c1c' : '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
            {openIncidents}
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Awaiting staff resolution</span>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
          Recent Bookings & Revenue Log
        </h3>
        {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
          <p style={{ color: '#64748b' }}>No reservations recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem' }}>Space</th>
                  <th style={{ padding: '0.75rem' }}>Vehicle</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Fee</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b, i) => (
                  <tr key={b.booking_id || b.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>#{b.booking_id || b.id || i + 1}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '700' }}>{b.slot_number || b.space_code}</td>
                    <td style={{ padding: '0.75rem' }}>{b.vehicle_number}</td>
                    <td style={{ padding: '0.75rem' }}>{b.status || 'Active'}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '600', color: '#166534' }}>
                      ₹{Number(b.total_amount || b.amount || b.fee || 20)}
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
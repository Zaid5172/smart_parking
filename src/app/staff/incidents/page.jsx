'use client';

import { useState, useEffect } from 'react';

export default function StaffIncidentQueuePage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.incidents) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_id: id, status: newStatus }),
      });

      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) =>
            (inc.incident_id || inc.id) === id ? { ...inc, status: newStatus } : inc
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'Resolved') return { bg: '#dcfce7', color: '#166534' };
    if (status === 'Under Review') return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#e0f2fe', color: '#0369a1' };
  };

  return (
    <div style={{ maxWidth: '820px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          Ground Operations: Incident Queue
        </h1>
        <button
          onClick={fetchIncidents}
          style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Refresh Queue
        </button>
      </div>
      <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>
        Review and resolve reported parking issues in real time.
      </p>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <p style={{ color: '#64748b' }}>No reported incidents found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {incidents.map((inc, idx) => {
            const incId = inc.incident_id || inc.id || idx + 1;
            const currentStatus = inc.status || 'Open';
            const badge = getBadgeStyle(currentStatus);

            return (
              <div
                key={incId}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {inc.title || inc.incident_type || 'Reported Incident'}
                  </h3>

                  <span
                    style={{
                      padding: '0.35rem 0.9rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      backgroundColor: badge.bg,
                      color: badge.color,
                    }}
                  >
                    {currentStatus}
                  </span>
                </div>

                <p style={{ color: '#334155', fontSize: '0.95rem', margin: '0 0 0.85rem 0' }}>
                  {inc.description || 'No details provided.'}
                </p>

                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                  Slot: <strong>{inc.slot_number || 'General'}</strong> | Vehicle: <strong>{inc.vehicle_number || 'N/A'}</strong> | Reported by: <strong>{inc.reported_by || inc.user_id || 'Customer'}</strong>
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => updateStatus(incId, 'Resolved')}
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#166534',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Mark Resolved
                  </button>

                  <button
                    onClick={() => updateStatus(incId, 'Under Review')}
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#0f766e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Under Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
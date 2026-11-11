'use client';

import { useState, useEffect } from 'react';

export default function StaffIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (res.ok) {
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error('Failed to load incidents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.incident_id === id ? { ...inc, status: newStatus } : inc))
        );
      }
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'Under Review':
      case 'Needs Clarification':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      default:
        return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>
        Ground Operations: Incident Queue
      </h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Review and resolve reported parking issues in real time.
      </p>

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
          No open incidents reported.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {incidents.map((incident) => (
            <div
              key={incident.incident_id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  {incident.title || 'Reported Incident'}
                </h3>
                
                {/* Interactive Status Badge/Dropdown */}
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(incident.incident_id, e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    ...getBadgeStyle(incident.status)
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <p style={{ color: '#334155', fontSize: '0.95rem', margin: '0.5rem 0 1rem 0' }}>
                {incident.description}
              </p>

              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                <strong>Slot:</strong> {incident.slot_number} &nbsp;|&nbsp; 
                <strong>Reported by:</strong> <span style={{ color: '#0f172a', fontWeight: '600' }}>{incident.reported_by}</span> ({incident.reporter_email})
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => updateStatus(incident.incident_id, 'Resolved')}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#166534',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => updateStatus(incident.incident_id, 'Under Review')}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#0f766e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Needs Clarification
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
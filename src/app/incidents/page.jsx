'use client';

import { useState, useEffect } from 'react';

export default function ReportIncidentPage() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.vehicle_number) {
          setVehicleNumber(parsed.vehicle_number);
        }
      } catch (_) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id || user?.id || 1,
          reported_by: user?.user_id || user?.id || 1,
          title,
          slot_number: slotNumber,
          vehicle_number: vehicleNumber,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Incident reported successfully.');
        setTitle('');
        setSlotNumber('');
        setVehicleNumber(user?.vehicle_number || '');
        setDescription('');
      } else {
        setMessage(`Error: ${data.error || 'Failed to submit report.'}`);
      }
    } catch (err) {
      setMessage('Error: Could not reach server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          Report a Parking Incident
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
          Reporting as: <strong>{user ? `${user.name} (${user.email || user.role})` : 'Guest'}</strong>
        </p>

        {message && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '600', background: message.startsWith('Error') ? '#fee2e2' : '#dcfce7', color: message.startsWith('Error') ? '#991b1b' : '#166534' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.35rem' }}>
              Issue Title
            </label>
            <input
              type="text"
              placeholder="e.g., Unauthorized vehicle parked in my reserved slot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                Slot Number / Location
              </label>
              <input
                type="text"
                placeholder="e.g., A-102"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                Vehicle Number
              </label>
              <input
                type="text"
                placeholder="e.g., KA01AB1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.35rem' }}>
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '0.85rem', backgroundColor: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.25rem' }}
          >
            {submitting ? 'Submitting...' : 'Submit Incident Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
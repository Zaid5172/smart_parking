'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReportIncidentPage() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id || user?.id || null,
          user_email: user?.email || 'Anonymous',
          title,
          description,
          slot_number: slotNumber
        }),
      });

      if (res.ok) {
        setMessage('Incident reported successfully!');
        setTitle('');
        setDescription('');
        setSlotNumber('');
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.error || 'Failed to submit incident'}`);
      }
    } catch (err) {
      setMessage('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Report a Parking Incident</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Reporting as: <strong>{user ? `${user.name || user.email} (${user.email})` : 'Guest / Not Signed In'}</strong>
      </p>

      {message && (
        <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: message.startsWith('Error') ? '#fee2e2' : '#dcfce7', color: message.startsWith('Error') ? '#991b1b' : '#166534' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Issue Title</label>
          <input
            type="text"
            placeholder="e.g., Unauthorized vehicle parked in my reserved slot"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Slot Number / Location</label>
          <input
            type="text"
            placeholder="e.g., A-102"
            value={slotNumber}
            onChange={(e) => setSlotNumber(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Detailed Description</label>
          <textarea
            rows="4"
            placeholder="Provide details about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
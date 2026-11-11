'use client';

import { useState, useEffect } from 'react';

export default function FindParkingPage() {
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehicleRegistration, setVehicleRegistration] = useState('KA01AB1234');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }

    // Default mock slots matching your UI (Replace/connect with your GET /api/slots endpoint)
    setSlots([
      { id: 'A-101', type: 'Standard', status: 'Available', location: 'Central Campus Garage' },
      { id: 'A-102', type: 'EV', status: 'Available', location: 'Central Campus Garage' },
      { id: 'A-103', type: 'Handicapped', status: 'Available', location: 'Central Campus Garage' },
      { id: 'A-104', type: 'Standard', status: 'Available', location: 'Central Campus Garage' },
      { id: 'B-201', type: 'Standard', status: 'Available', location: 'Central Campus Garage' },
      { id: 'B-202', type: 'EV', status: 'Occupied', location: 'Central Campus Garage' },
      { id: 'B-203', type: 'Standard', status: 'Maintenance', location: 'Central Campus Garage' }
    ]);
  }, []);

  const filteredSlots = filterType === 'All' 
    ? slots 
    : slots.filter(s => s.type === filterType);

  const getSlotColor = (status, isSelected) => {
    if (isSelected) return { bg: '#dcfce7', border: '#166534' };
    if (status === 'Occupied') return { bg: '#fee2e2', border: '#fca5a5' };
    if (status === 'Maintenance') return { bg: '#f1f5f9', border: '#cbd5e1' };
    return { bg: '#f0fdf4', border: '#bbf7d0' };
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setMessage('Error: Please select an available space first.');
      return;
    }
    if (!user) {
      setMessage('Error: You must be signed in to reserve a space.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id || user.id,
          user_email: user.email,
          slot_number: selectedSlot.id,
          vehicle_number: vehicleRegistration
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! Slot ${selectedSlot.id} reserved for ${user.name || user.email}.`);
        // Update slot status dynamically
        setSlots(slots.map(s => s.id === selectedSlot.id ? { ...s, status: 'Occupied' } : s));
        setSelectedSlot(null);
      } else {
        setMessage(`Error: ${data.error || 'Failed to confirm reservation.'}`);
      }
    } catch (err) {
      setMessage('Error: Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>
        FIND YOUR SPACE
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Park with confidence.
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
            ₹20 per hour · ₹15 minimum · Demo payments only
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
        >
          Refresh spaces
        </button>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', background: message.startsWith('Error') ? '#fee2e2' : '#dcfce7', color: message.startsWith('Error') ? '#991b1b' : '#166534', fontWeight: '500' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Side: Live Availability Grid */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Live availability</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                Green: available · Red: occupied · Grey: maintenance
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', marginRight: '0.5rem', color: '#64748b' }}>Space type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="All">All</option>
                <option value="Standard">Standard</option>
                <option value="EV">EV</option>
                <option value="Handicapped">Handicapped</option>
              </select>
            </div>
          </div>

          {/* Slots Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            {filteredSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const style = getSlotColor(slot.status, isSelected);
              const isAvailable = slot.status === 'Available';

              return (
                <div
                  key={slot.id}
                  onClick={() => isAvailable && setSelectedSlot(slot)}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: style.bg,
                    border: `2px solid ${style.border}`,
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{slot.id}</h4>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', marginTop: '0.25rem' }}>{slot.type}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{slot.status}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem' }}>{slot.location}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Reservation Panel */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Your reservation</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            {selectedSlot ? `Selected Space: ${selectedSlot.id} (${selectedSlot.type})` : 'Select an available space to begin.'}
          </p>

          <form onSubmit={handleReservation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Vehicle registration
              </label>
              <input
                type="text"
                value={vehicleRegistration}
                onChange={(e) => setVehicleRegistration(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0' }}>
              Your stay begins when you confirm. Checkout records a simulated payment.
            </p>

            <button
              type="submit"
              disabled={!selectedSlot || loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: selectedSlot ? '#166534' : '#94a3b8',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: selectedSlot ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Processing...' : selectedSlot ? `Confirm Reservation (${selectedSlot.id})` : 'Confirm reservation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

// Fetch user's past & active bookings with date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('user_id');
    const userName = searchParams.get('user_name');

    if ((!userId || userId === 'undefined') && userName) {
      const [users] = await pool.execute('SELECT user_id FROM users WHERE name = ? LIMIT 1', [userName]);
      if (users.length > 0) userId = users[0].user_id;
    }

    if (!userId || userId === 'undefined') {
      return NextResponse.json({ bookings: [] });
    }

    const [rows] = await pool.execute(
  'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_id DESC',
  [userId]
);
    return NextResponse.json({ bookings: rows });
  } catch (error) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new booking
export async function POST(request) {
  try {
    const body = await request.json();
    const { slot_number, vehicle_number, user_email, user_name } = body;
    let userId = body.user_id;

    if ((!userId || userId === 'undefined') && (user_email || user_name)) {
      const [users] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ? OR name = ? LIMIT 1',
        [user_email || '', user_name || '']
      );
      if (users.length > 0) userId = users[0].user_id;
    }

    if (!userId || userId === 'undefined') {
      const [fallback] = await pool.execute('SELECT user_id FROM users LIMIT 1');
      userId = fallback.length > 0 ? fallback[0].user_id : 1;
    }

    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, slot_number, vehicle_number, status) VALUES (?, ?, ?, 'Active')`,
      [userId, slot_number, vehicle_number]
    );

    return NextResponse.json({ success: true, booking_id: result.insertId });
  } catch (error) {
    console.error('Create Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
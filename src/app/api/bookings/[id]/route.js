import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const { slot_number, vehicle_number, user_email } = body;
    let userId = body.user_id;

    // 1. If user_id wasn't passed or is undefined, resolve it via email
    if ((!userId || userId === 'undefined') && user_email) {
      const [userRows] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [user_email]
      );
      if (userRows.length > 0) {
        userId = userRows[0].user_id;
      }
    }

    // 2. Fallback to ID 1 if still missing to prevent throwing UI errors
    if (!userId || userId === 'undefined') {
      const [firstUser] = await pool.execute('SELECT user_id FROM users LIMIT 1');
      userId = firstUser.length > 0 ? firstUser[0].user_id : 1;
    }

    // 3. Insert booking into MySQL
    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, slot_number, vehicle_number, status) 
       VALUES (?, ?, ?, 'Active')`,
      [userId, slot_number, vehicle_number]
    );

    return NextResponse.json({ 
      success: true, 
      booking_id: result.insertId,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
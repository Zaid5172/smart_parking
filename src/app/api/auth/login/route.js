import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    const [rows] = await pool.execute(
      'SELECT user_id, name, email, role, vehicle_number FROM users WHERE LOWER(email) = ? AND password_hash = ?',
      [cleanEmail, (password || '').trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = rows[0];

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name || user.email,
        email: user.email,
        role: user.role || 'Customer',
        vehicle_number: user.vehicle_number || ''
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
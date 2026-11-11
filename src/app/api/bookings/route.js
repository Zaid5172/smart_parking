import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';

// GET: Fetch active bookings along with user identity
export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        b.booking_id,
        b.slot_number,
        b.vehicle_number,
        b.status,
        b.start_time,
        u.user_id,
        COALESCE(u.name, u.email) AS booked_by_user,
        u.email AS user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      ORDER BY b.booking_id DESC
    `);

    return NextResponse.json({ bookings: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Reserve a slot linked directly to user_id
export async function POST(request) {
  try {
    const { user_id, slot_number, vehicle_number } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is missing. Please re-login.' }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, slot_number, vehicle_number, status) 
       VALUES (?, ?, ?, 'Active')`,
      [user_id, slot_number, vehicle_number]
    );

    return NextResponse.json({ success: true, booking_id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
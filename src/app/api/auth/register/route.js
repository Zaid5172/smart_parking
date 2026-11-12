import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function POST(request) {
  try {
    const { name, email, password, vehicle_number, phone_number } = await request.json();

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanVehicle = (vehicle_number || '').trim().toUpperCase();
    const cleanPhone = (phone_number || '').trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT user_id FROM users WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Insert new Customer account
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role, vehicle_number, phone_number)
       VALUES (?, ?, ?, 'Customer', ?, ?)`,
      [cleanName, cleanEmail, cleanPassword, cleanVehicle || null, cleanPhone || null]
    );

    const userPayload = {
      user_id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      role: 'Customer',
      vehicle_number: cleanVehicle
    };

    return NextResponse.json({
      success: true,
      user: userPayload
    });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
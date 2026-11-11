import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';

// GET: Fetch incidents from incident_reports
export async function GET() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        i.report_id AS incident_id,
        i.title,
        i.description,
        i.status,
        COALESCE(i.slot_number, 'N/A') AS slot_number,
        COALESCE(u.name, i.user_email, 'Anonymous Customer') AS reported_by,
        COALESCE(u.email, i.user_email, 'N/A') AS reporter_email
      FROM incident_reports i
      LEFT JOIN users u ON i.user_id = u.user_id
      ORDER BY i.report_id DESC
    `);

    return NextResponse.json({ incidents: rows });
  } catch (error) {
    console.error('Fetch Incidents Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save new incident to incident_reports
export async function POST(request) {
  try {
    const { user_id, user_email, title, description, slot_number } = await request.json();

    const [result] = await pool.execute(
      `INSERT INTO incident_reports (user_id, user_email, title, description, slot_number, status) 
       VALUES (?, ?, ?, ?, ?, 'Open')`,
      [user_id || null, user_email || 'Anonymous', title, description, slot_number]
    );

    return NextResponse.json({ success: true, incident_id: result.insertId });
  } catch (error) {
    console.error('Create Incident Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
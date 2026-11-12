import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM incident_reports');
    rows.sort((a, b) => (b.incident_id || b.id || 0) - (a.incident_id || a.id || 0));

    return NextResponse.json({ incidents: rows });
  } catch (error) {
    console.error('Fetch Incidents Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, title, slot_number, vehicle_number, description, reported_by } = body;

    const [cols] = await pool.execute('DESCRIBE incident_reports');
    const colNames = cols.map((c) => c.Field);

    const fields = [];
    const values = [];

    if (colNames.includes('user_id') && user_id) {
      fields.push('user_id');
      values.push(user_id);
    }
    if (colNames.includes('reported_by') && (reported_by || user_id)) {
      fields.push('reported_by');
      values.push(reported_by || user_id);
    }
    if (colNames.includes('title')) {
      fields.push('title');
      values.push(title || 'Parking Incident');
    }
    if (colNames.includes('incident_type') && !colNames.includes('title')) {
      fields.push('incident_type');
      values.push(title || 'Parking Incident');
    }
    if (colNames.includes('slot_number')) {
      fields.push('slot_number');
      values.push(slot_number || 'General');
    }
    if (colNames.includes('vehicle_number')) {
      fields.push('vehicle_number');
      values.push((vehicle_number || '').trim().toUpperCase() || null);
    }
    if (colNames.includes('description')) {
      fields.push('description');
      values.push(description || '');
    }
    if (colNames.includes('status')) {
      fields.push('status');
      values.push('Open');
    }

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.execute(
      `INSERT INTO incident_reports (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return NextResponse.json({ success: true, incident_id: result.insertId });
  } catch (error) {
    console.error('Create Incident Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { incident_id, status } = await request.json();
    if (!incident_id) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const [cols] = await pool.execute('DESCRIBE incident_reports');
    const pkCol = cols.find((c) => c.Key === 'PRI')?.Field || 'incident_id';

    await pool.execute(
      `UPDATE incident_reports SET status = ? WHERE ${pkCol} = ?`,
      [status || 'Resolved', incident_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resolve Incident Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    await pool.execute(
      'UPDATE incident_reports SET status = ? WHERE report_id = ? OR incident_id = ?',
      [status, id, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Incident Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
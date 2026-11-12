import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    // 1. Dynamic slot counts from `parking_slots`
    const [slotStats] = await pool.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance
      FROM parking_slots
    `);

    const totalSlots = Number(slotStats[0]?.total || 0);
    const availableSlots = Number(slotStats[0]?.available || 0);
    const occupiedSlots = Number(slotStats[0]?.occupied || 0);
    const maintenanceSlots = Number(slotStats[0]?.maintenance || 0);

    // 2. Recorded revenue from `payments` (fallback to `bookings`)
    let totalRevenue = 0;
    try {
      const [payRows] = await pool.execute('SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments');
      totalRevenue = Number(payRows[0]?.revenue || 0);
    } catch (_) {}

    const [bookingRows] = await pool.execute('SELECT * FROM bookings');
    // Sort newest first using primary key (booking_id or id) safely
    bookingRows.sort((a, b) => (b.booking_id || b.id || 0) - (a.booking_id || a.id || 0));

    if (totalRevenue === 0 && bookingRows.length > 0) {
      totalRevenue = bookingRows.reduce(
        (sum, b) => sum + Number(b.total_amount || b.amount || b.fee || 20),
        0
      );
    }

    // 3. Open incidents from `incident_reports`
    let openIncidents = 0;
    try {
      const [incRows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM incident_reports WHERE status != 'Resolved'"
      );
      openIncidents = Number(incRows[0]?.count || 0);
    } catch (_) {}

    const occupancyRate = totalSlots > 0
      ? Math.round((occupiedSlots / totalSlots) * 100)
      : 0;

    return NextResponse.json({
      recordedRevenue: totalRevenue,
      totalRevenue,
      totalSlots,
      availableSlots,
      occupiedSlots,
      maintenanceSlots,
      occupancyRate,
      totalBookings: bookingRows.length,
      openIncidents,
      retainedEvents: bookingRows.length + openIncidents,
      recentBookings: bookingRows.slice(0, 10)
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
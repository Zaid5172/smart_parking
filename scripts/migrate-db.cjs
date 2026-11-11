const fs = require('node:fs');
const connect = require('./db-connection.cjs');

(async () => {
  const db = await connect();
  try {
    const [[lock]] = await db.query("SELECT GET_LOCK('parking_dbms_audit_migration',10) acquired");
    if (lock.acquired !== 1) throw Error('Another migration is running.');

    // 1. Add phone to users if not present
    const [userPhone] = await db.query("SHOW COLUMNS FROM users LIKE 'phone'");
    if (!userPhone.length) {
      await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER role");
    }

    // 2. Add make_model to vehicles if not present
    const [makeModel] = await db.query("SHOW COLUMNS FROM vehicles LIKE 'make_model'");
    if (!makeModel.length) {
      await db.query("ALTER TABLE vehicles ADD COLUMN make_model VARCHAR(100) NULL AFTER license_plate");
    }
    const [vehCreated] = await db.query("SHOW COLUMNS FROM vehicles LIKE 'created_at'");
    if (!vehCreated.length) {
      await db.query("ALTER TABLE vehicles ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER make_model");
    }

    // 3. Add booking_type, start_time, end_time, time_slot to bookings
    const [bookingType] = await db.query("SHOW COLUMNS FROM bookings LIKE 'booking_type'");
    if (!bookingType.length) {
      await db.query("ALTER TABLE bookings ADD COLUMN booking_type ENUM('Instant','Scheduled') NOT NULL DEFAULT 'Instant' AFTER status");
      await db.query("ALTER TABLE bookings ADD COLUMN start_time TIMESTAMP NULL AFTER booking_type");
      await db.query("ALTER TABLE bookings ADD COLUMN end_time TIMESTAMP NULL AFTER start_time");
      await db.query("ALTER TABLE bookings ADD COLUMN time_slot VARCHAR(60) NULL AFTER end_time");
      await db.query("ALTER TABLE bookings MODIFY COLUMN status ENUM('Active','Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Active'");
    }

    // 4. Update foreign key constraints & unique keys
    const [indexes] = await db.query("SHOW INDEX FROM vehicles WHERE Key_name='uq_vehicle_owner'");
    if (!indexes.length) await db.query('ALTER TABLE vehicles ADD UNIQUE KEY uq_vehicle_owner(vehicle_id,user_id)');

    const [constraints] = await db.execute("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND CONSTRAINT_NAME='fk_booking_vehicle_owner'");
    if (!constraints.length) await db.query('ALTER TABLE bookings ADD CONSTRAINT fk_booking_vehicle_owner FOREIGN KEY(vehicle_id,user_id) REFERENCES vehicles(vehicle_id,user_id)');

    // 5. Update view & stored function
    const schema = fs.readFileSync('database/mysql_schema.sql', 'utf8');
    const view = schema.match(/CREATE VIEW vw_active_occupancy AS[\s\S]*?;/)[0].replace('CREATE VIEW', 'CREATE OR REPLACE VIEW');
    await db.query(view);

    const routine = schema.match(/CREATE FUNCTION calculate_parking_fee[\s\S]*?END \/\//)[0].replace(/ \/\/$/, '');
    await db.query('DROP FUNCTION IF EXISTS calculate_parking_fee');
    await db.query(routine);

    console.log('Database fixes and new features migration applied successfully. Existing data preserved.');
  } finally {
    await db.query("SELECT RELEASE_LOCK('parking_dbms_audit_migration')").catch(() => {});
    await db.end();
  }
})().catch(e => {
  console.error(e.message);
  process.exitCode = 1;
});

import bcrypt from 'bcryptjs';
import { getDatabase, query } from './db.js';

export async function initDatabase() {
  await getDatabase();

  console.log('[Database] Initializing schema tables...');

  // Create tables in order
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      blood_group TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      last_donation_date DATE NULL,
      is_available INTEGER DEFAULT 1,
      medical_eligibility_status TEXT DEFAULT 'ELIGIBLE',
      medical_notes TEXT NULL,
      donation_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      registration_number TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      is_verified INTEGER DEFAULT 0,
      verified_by INTEGER NULL,
      contact_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS blood_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      creator_id INTEGER NOT NULL,
      hospital_id INTEGER NULL,
      hospital_name TEXT NOT NULL,
      required_blood_group TEXT NOT NULL,
      blood_component TEXT NOT NULL DEFAULT 'Whole Blood',
      units_required INTEGER NOT NULL DEFAULT 1,
      urgency_level TEXT NOT NULL DEFAULT 'Normal',
      required_datetime DATETIME NOT NULL,
      description TEXT NULL,
      verification_status TEXT DEFAULT 'PENDING',
      verified_by INTEGER NULL,
      verified_at DATETIME NULL,
      request_status TEXT NOT NULL DEFAULT 'Pending Verification',
      current_search_radius_km INTEGER DEFAULT 5,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donor_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      donor_id INTEGER NOT NULL,
      compatibility_reason TEXT NOT NULL,
      distance_km REAL NOT NULL,
      match_score INTEGER NOT NULL DEFAULT 100,
      status TEXT DEFAULT 'IDENTIFIED',
      contacted_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (request_id, donor_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donor_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL UNIQUE,
      request_id INTEGER NOT NULL,
      donor_id INTEGER NOT NULL,
      response TEXT NOT NULL,
      response_notes TEXT NULL,
      responded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES donor_matches(id) ON DELETE CASCADE,
      FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO',
      related_request_id INTEGER NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (related_request_id) REFERENCES blood_requests(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS donation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NULL,
      donor_id INTEGER NOT NULL,
      hospital_id INTEGER NULL,
      units_donated INTEGER NOT NULL DEFAULT 1,
      blood_group TEXT NOT NULL,
      blood_component TEXT NOT NULL,
      donation_date DATE NOT NULL,
      verified_by INTEGER NULL,
      certificate_number TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE SET NULL,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NULL,
      details TEXT NULL,
      ip_address TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('[Database] Schema verified successfully.');
}

export async function seedDatabase() {
  await initDatabase();

  const userCount = await query('SELECT COUNT(*) as count FROM users');
  const count = userCount[0]?.count || 0;
  if (count > 0) {
    console.log(`[Database] Database already contains ${count} users. Seeding skipped.`);
    return;
  }

  console.log('[Database] Seeding realistic sample healthcare data...');

  const passHash = await bcrypt.hash('Donor@123', 10);
  const patientHash = await bcrypt.hash('Patient@123', 10);
  const hospitalHash = await bcrypt.hash('Hospital@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // 1. Admin
  const adminRes = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE')`,
    ['admin@lifelink.ai', adminHash, 'LifeLink System Admin', '+1-800-555-0100']
  );

  // 2. Hospitals
  const hosp1User = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'HOSPITAL', ?, ?, 'ACTIVE')`,
    ['hospital@lifelink.ai', hospitalHash, 'Apex Multi-Speciality Hospital', '+1-800-555-0199']
  );
  const hosp1 = await query(
    `INSERT INTO hospitals (user_id, name, registration_number, city, address, latitude, longitude, is_verified, verified_by, contact_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [hosp1User.insertId, 'Apex Multi-Speciality Hospital', 'HOSP-NY-84920', 'New York', '450 Lexington Ave, New York, NY 10017', 40.7527, -73.9772, adminRes.insertId, '+1-212-555-0199']
  );

  const hosp2User = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'HOSPITAL', ?, ?, 'ACTIVE')`,
    ['citycare@lifelink.ai', hospitalHash, 'City Care Trauma Center', '+1-800-555-0188']
  );
  const hosp2 = await query(
    `INSERT INTO hospitals (user_id, name, registration_number, city, address, latitude, longitude, is_verified, verified_by, contact_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [hosp2User.insertId, 'City Care Trauma Center', 'HOSP-NY-77312', 'New York', '120 E 34th St, New York, NY 10016', 40.7465, -73.9795, adminRes.insertId, '+1-212-555-0188']
  );

  const hosp3User = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'HOSPITAL', ?, ?, 'ACTIVE')`,
    ['stjudes@lifelink.ai', hospitalHash, 'St. Jude Community Hospital', '+1-800-555-0177']
  );
  await query(
    `INSERT INTO hospitals (user_id, name, registration_number, city, address, latitude, longitude, is_verified, verified_by, contact_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)`,
    [hosp3User.insertId, 'St. Jude Community Hospital', 'HOSP-NY-61204', 'New York', '890 2nd Ave, New York, NY 10017', 40.7533, -73.9698, '+1-212-555-0177']
  );

  // 3. Patients
  const patient1 = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'PATIENT', ?, ?, 'ACTIVE')`,
    ['patient@lifelink.ai', patientHash, 'John Anderson', '+1-917-555-3321']
  );
  const patient2 = await query(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'PATIENT', ?, ?, 'ACTIVE')`,
    ['maria.patient@lifelink.ai', patientHash, 'Maria Garcia', '+1-917-555-4490']
  );

  // 4. Donors
  const donorsData = [
    { email: 'donor@lifelink.ai', name: 'Alex Rivera (Demo Donor)', blood: 'O-', city: 'New York', lat: 40.7549, lng: -73.9840, last: '2026-05-15', avail: 1, count: 4 },
    { email: 'sarah.donor@lifelink.ai', name: 'Sarah Jenkins', blood: 'A+', city: 'New York', lat: 40.7580, lng: -73.9855, last: '2026-06-10', avail: 1, count: 2 },
    { email: 'rahul.donor@lifelink.ai', name: 'Rahul Sharma', blood: 'B+', city: 'New York', lat: 40.7484, lng: -73.9857, last: '2026-04-01', avail: 1, count: 5 },
    { email: 'priya.donor@lifelink.ai', name: 'Priya Patel', blood: 'AB+', city: 'New York', lat: 40.7418, lng: -73.9893, last: '2026-07-20', avail: 1, count: 1 },
    { email: 'michael.donor@lifelink.ai', name: 'Michael Chang', blood: 'O+', city: 'New York', lat: 40.7614, lng: -73.9776, last: '2026-03-12', avail: 1, count: 7 },
    { email: 'emily.donor@lifelink.ai', name: 'Emily Watson', blood: 'A-', city: 'New York', lat: 40.7688, lng: -73.9680, last: '2026-08-01', avail: 1, count: 3 },
    { email: 'david.donor@lifelink.ai', name: 'David Miller', blood: 'B-', city: 'New York', lat: 40.7300, lng: -73.9950, last: '2026-09-01', avail: 0, count: 1, notes: 'Recent dental procedure - temporary rest' }
  ];

  const donorUserIds = [];
  for (const d of donorsData) {
    const u = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'DONOR', ?, ?, 'ACTIVE')`,
      [d.email, passHash, d.name, '+1-917-555-' + Math.floor(1000 + Math.random() * 9000)]
    );
    donorUserIds.push(u.insertId);
    await query(
      `INSERT INTO donor_profiles (user_id, blood_group, city, latitude, longitude, last_donation_date, is_available, medical_eligibility_status, medical_notes, donation_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ELIGIBLE', ?, ?)`,
      [u.insertId, d.blood, d.city, d.lat, d.lng, d.last, d.avail, d.notes || null, d.count]
    );
  }

  // 5. Blood Requests
  // Req 1: Verified & Searching for Donors (Created by Hospital)
  const req1 = await query(
    `INSERT INTO blood_requests (
      request_code, creator_id, hospital_id, hospital_name, required_blood_group,
      blood_component, units_required, urgency_level, required_datetime, description,
      verification_status, verified_by, verified_at, request_status, current_search_radius_km, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+1 day'), ?, 'VERIFIED', ?, datetime('now'), 'Searching for Donors', 10, 40.7527, -73.9772)`,
    ['REQ-2026-8910', hosp1User.insertId, hosp1.insertId, 'Apex Multi-Speciality Hospital', 'O-', 'Whole Blood', 2, 'Critical', 'Emergency surgery required for cardiac patient with acute trauma.', hosp1User.insertId]
  );

  // Req 2: Pending Verification (Created by Patient)
  const req2 = await query(
    `INSERT INTO blood_requests (
      request_code, creator_id, hospital_id, hospital_name, required_blood_group,
      blood_component, units_required, urgency_level, required_datetime, description,
      verification_status, request_status, current_search_radius_km, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+3 days'), ?, 'PENDING', 'Pending Verification', 5, 40.7465, -73.9795)`,
    ['REQ-2026-8911', patient1.insertId, hosp2.insertId, 'City Care Trauma Center', 'A+', 'Red Blood Cells (PRBC)', 3, 'Urgent', 'Scheduled orthopedic surgery for elderly patient requiring blood reserve.']
  );

  // Req 3: Fulfilled Request
  const req3 = await query(
    `INSERT INTO blood_requests (
      request_code, creator_id, hospital_id, hospital_name, required_blood_group,
      blood_component, units_required, urgency_level, required_datetime, description,
      verification_status, verified_by, verified_at, request_status, current_search_radius_km, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), ?, 'VERIFIED', ?, datetime('now', '-3 days'), 'Fulfilled', 5, 40.7527, -73.9772)`,
    ['REQ-2026-8905', patient2.insertId, hosp1.insertId, 'Apex Multi-Speciality Hospital', 'B+', 'Platelets (RDP/SDP)', 1, 'Normal', 'Chemotherapy supportive platelet transfusion successfully completed.', hosp1User.insertId]
  );

  // Req 4: Submitted Request by Patient (Awaiting initial review)
  await query(
    `INSERT INTO blood_requests (
      request_code, creator_id, hospital_id, hospital_name, required_blood_group,
      blood_component, units_required, urgency_level, required_datetime, description,
      verification_status, request_status, current_search_radius_km, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+2 days'), ?, 'PENDING', 'Submitted', 5, 40.7527, -73.9772)`,
    ['REQ-2026-8912', patient1.insertId, hosp1.insertId, 'Apex Multi-Speciality Hospital', 'AB+', 'Fresh Frozen Plasma (FFP)', 2, 'Normal', 'Plasma requirement for liver treatment procedure.']
  );

  // 6. Matches for Request 1 (O- Blood request)
  // Alex Rivera (O- donor) - Contacted
  const match1 = await query(
    `INSERT INTO donor_matches (request_id, donor_id, compatibility_reason, distance_km, match_score, status, contacted_at)
     VALUES (?, ?, 'Exact O- Universal match (0.6 km from hospital)', 0.62, 98, 'CONTACTED', datetime('now', '-2 hours'))`,
    [req1.insertId, donorUserIds[0]]
  );

  // Michael Chang (O+ donor - compatible for RBC if patient was O+, but this is O- request so O- only)
  // Let's also add notification for Alex Rivera
  await query(
    `INSERT INTO notifications (user_id, title, message, type, related_request_id)
     VALUES (?, ?, ?, 'URGENT', ?)`,
    [donorUserIds[0], 'Critical Blood Request: O- Needed', 'Apex Multi-Speciality Hospital has a critical request for 2 units of O- Whole Blood. You are within 1 km.', req1.insertId]
  );

  // 7. Donation History Record for Alex Rivera and Rahul Sharma
  await query(
    `INSERT INTO donation_records (request_id, donor_id, hospital_id, units_donated, blood_group, blood_component, donation_date, verified_by, certificate_number)
     VALUES (?, ?, ?, 1, 'O-', 'Whole Blood', '2026-05-15', ?, 'CERT-LL-2026-9041')`,
    [req3.insertId, donorUserIds[0], hosp1.insertId, hosp1User.insertId]
  );
  await query(
    `INSERT INTO donation_records (request_id, donor_id, hospital_id, units_donated, blood_group, blood_component, donation_date, verified_by, certificate_number)
     VALUES (?, ?, ?, 1, 'B+', 'Platelets (RDP/SDP)', '2026-04-01', ?, 'CERT-LL-2026-8812')`,
    [req3.insertId, donorUserIds[2], hosp1.insertId, hosp1User.insertId]
  );

  // 8. Audit Logs
  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, 'SYSTEM_INIT', 'SYSTEM', 1, 'LifeLink AI database successfully seeded with demonstration data.')`,
    [adminRes.insertId]
  );

  console.log('[Database] Seed data successfully populated.');
}

// Allow direct CLI execution: `node src/database/initDb.js`
if (process.argv[1]?.includes('initDb.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Database] Database initialization script complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Database] Initialization error:', err);
      process.exit(1);
    });
}

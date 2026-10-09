-- LifeLink AI Seed Data for MySQL
-- Passwords below are hashed with bcrypt for demo accounts

-- 1. Admin: admin@lifelink.ai / Admin@123
INSERT INTO users (id, email, password_hash, role, full_name, phone, status)
VALUES (1, 'admin@lifelink.ai', '$2a$10$w3U68Zc.b3jVjR.2W627sO6oZp2wS9a5fB2Ksm.W9uM4gQW4O7R.e', 'ADMIN', 'LifeLink System Admin', '+1-800-555-0100', 'ACTIVE')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Hospitals: hospital@lifelink.ai / Hospital@123
INSERT INTO users (id, email, password_hash, role, full_name, phone, status)
VALUES 
(2, 'hospital@lifelink.ai', '$2a$10$tJ9f4/vWw7RjY47sU.O41.PZ0bTqm0C/X68Wv8O1d5eN2lA6mP5Cq', 'HOSPITAL', 'Apex Multi-Speciality Hospital', '+1-800-555-0199', 'ACTIVE'),
(3, 'citycare@lifelink.ai', '$2a$10$tJ9f4/vWw7RjY47sU.O41.PZ0bTqm0C/X68Wv8O1d5eN2lA6mP5Cq', 'HOSPITAL', 'City Care Trauma Center', '+1-800-555-0188', 'ACTIVE'),
(4, 'stjudes@lifelink.ai', '$2a$10$tJ9f4/vWw7RjY47sU.O41.PZ0bTqm0C/X68Wv8O1d5eN2lA6mP5Cq', 'HOSPITAL', 'St. Jude Community Hospital', '+1-800-555-0177', 'ACTIVE')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO hospitals (id, user_id, name, registration_number, city, address, latitude, longitude, is_verified, verified_by, contact_phone)
VALUES
(1, 2, 'Apex Multi-Speciality Hospital', 'HOSP-NY-84920', 'New York', '450 Lexington Ave, New York, NY 10017', 40.7527, -73.9772, 1, 1, '+1-212-555-0199'),
(2, 3, 'City Care Trauma Center', 'HOSP-NY-77312', 'New York', '120 E 34th St, New York, NY 10016', 40.7465, -73.9795, 1, 1, '+1-212-555-0188'),
(3, 4, 'St. Jude Community Hospital', 'HOSP-NY-61204', 'New York', '890 2nd Ave, New York, NY 10017', 40.7533, -73.9698, 0, NULL, '+1-212-555-0177')
ON DUPLICATE KEY UPDATE id=id;

-- 3. Patients: patient@lifelink.ai / Patient@123
INSERT INTO users (id, email, password_hash, role, full_name, phone, status)
VALUES
(5, 'patient@lifelink.ai', '$2a$10$w3U68Zc.b3jVjR.2W627sO6oZp2wS9a5fB2Ksm.W9uM4gQW4O7R.e', 'PATIENT', 'John Anderson', '+1-917-555-3321', 'ACTIVE'),
(6, 'maria.patient@lifelink.ai', '$2a$10$w3U68Zc.b3jVjR.2W627sO6oZp2wS9a5fB2Ksm.W9uM4gQW4O7R.e', 'PATIENT', 'Maria Garcia', '+1-917-555-4490', 'ACTIVE')
ON DUPLICATE KEY UPDATE id=id;

-- 4. Donors: donor@lifelink.ai / Donor@123
INSERT INTO users (id, email, password_hash, role, full_name, phone, status)
VALUES
(7, 'donor@lifelink.ai', '$2a$10$p0b3fUuV.qVvYpU77t00EOW5o0q7.pG5fW6p5Qv0o0m7tU1V2v3mC', 'DONOR', 'Alex Rivera (Demo Donor)', '+1-917-555-1001', 'ACTIVE'),
(8, 'sarah.donor@lifelink.ai', '$2a$10$p0b3fUuV.qVvYpU77t00EOW5o0q7.pG5fW6p5Qv0o0m7tU1V2v3mC', 'DONOR', 'Sarah Jenkins', '+1-917-555-1002', 'ACTIVE'),
(9, 'rahul.donor@lifelink.ai', '$2a$10$p0b3fUuV.qVvYpU77t00EOW5o0q7.pG5fW6p5Qv0o0m7tU1V2v3mC', 'DONOR', 'Rahul Sharma', '+1-917-555-1003', 'ACTIVE'),
(10, 'priya.donor@lifelink.ai', '$2a$10$p0b3fUuV.qVvYpU77t00EOW5o0q7.pG5fW6p5Qv0o0m7tU1V2v3mC', 'DONOR', 'Priya Patel', '+1-917-555-1004', 'ACTIVE')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO donor_profiles (id, user_id, blood_group, city, latitude, longitude, last_donation_date, is_available, medical_eligibility_status, donation_count)
VALUES
(1, 7, 'O-', 'New York', 40.7549, -73.9840, '2026-05-15', 1, 'ELIGIBLE', 4),
(2, 8, 'A+', 'New York', 40.7580, -73.9855, '2026-06-10', 1, 'ELIGIBLE', 2),
(3, 9, 'B+', 'New York', 40.7484, -73.9857, '2026-04-01', 1, 'ELIGIBLE', 5),
(4, 10, 'AB+', 'New York', 40.7418, -73.9893, '2026-07-20', 1, 'ELIGIBLE', 1)
ON DUPLICATE KEY UPDATE id=id;

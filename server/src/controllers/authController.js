import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidators.js';
import { logAudit } from '../services/auditService.js';
import { ROLES } from '../../../shared/constants/roles.js';

const JWT_SECRET = process.env.JWT_SECRET || 'lifelink_super_secret_jwt_key_2026_dev_mode';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req, res, next) {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { email, password, role, fullName, phone } = req.body;

    // Check duplicate email
    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await query(
      `INSERT INTO users (email, password_hash, role, full_name, phone, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [email.toLowerCase().trim(), passwordHash, role, fullName.trim(), phone || null]
    );

    const userId = userRes.insertId;

    // Create role-specific secondary profile
    if (role === ROLES.DONOR) {
      const { bloodGroup, city, latitude, longitude, lastDonationDate } = req.body;
      await query(
        `INSERT INTO donor_profiles (user_id, blood_group, city, latitude, longitude, last_donation_date, is_available, medical_eligibility_status)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'ELIGIBLE')`,
        [userId, bloodGroup, city || 'New York', latitude || 40.75, longitude || -73.98, lastDonationDate || null]
      );
    } else if (role === ROLES.HOSPITAL) {
      const { hospitalName, registrationNumber, city, address, latitude, longitude, contactPhone } = req.body;
      await query(
        `INSERT INTO hospitals (user_id, name, registration_number, city, address, latitude, longitude, is_verified, contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [userId, hospitalName, registrationNumber, city || 'New York', address, latitude || 40.7527, longitude || -73.9772, contactPhone || phone]
      );
    }

    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    await logAudit({
      userId,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: userId,
      details: { role, email }
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        role,
        fullName: fullName.trim(),
        phone: phone || null
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { email, password } = req.body;
    const rows = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    // Role profile data
    let roleProfile = null;
    if (user.role === ROLES.DONOR) {
      const donorRows = await query('SELECT * FROM donor_profiles WHERE user_id = ?', [user.id]);
      if (donorRows.length > 0) roleProfile = donorRows[0];
    } else if (user.role === ROLES.HOSPITAL) {
      const hospRows = await query('SELECT * FROM hospitals WHERE user_id = ?', [user.id]);
      if (hospRows.length > 0) roleProfile = hospRows[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        phone: user.phone,
        status: user.status,
        profile: roleProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    let roleProfile = null;

    if (user.role === ROLES.DONOR) {
      const donorRows = await query('SELECT * FROM donor_profiles WHERE user_id = ?', [user.id]);
      if (donorRows.length > 0) roleProfile = donorRows[0];
    } else if (user.role === ROLES.HOSPITAL) {
      const hospRows = await query('SELECT * FROM hospitals WHERE user_id = ?', [user.id]);
      if (hospRows.length > 0) roleProfile = hospRows[0];
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        phone: user.phone,
        status: user.status,
        profile: roleProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully.' });
}

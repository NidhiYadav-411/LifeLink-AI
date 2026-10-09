import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'lifelink_super_secret_jwt_key_2026_dev_mode';
    const decoded = jwt.verify(token, secret);

    const rows = await query(
      'SELECT id, email, role, full_name, phone, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found or expired.' });
    }

    const user = rows[0];
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'User account is suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

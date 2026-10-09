import { query } from '../database/db.js';

export async function createNotification({ userId, title, message, type = 'INFO', relatedRequestId = null }) {
  try {
    const res = await query(
      `INSERT INTO notifications (user_id, title, message, type, related_request_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, type, relatedRequestId]
    );
    return res.insertId;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
    return null;
  }
}

export async function notifyHospitalStaff(hospitalId, { title, message, type = 'INFO', relatedRequestId = null }) {
  try {
    const rows = await query(`SELECT user_id FROM hospitals WHERE id = ?`, [hospitalId]);
    if (rows && rows.length > 0) {
      await createNotification({
        userId: rows[0].user_id,
        title,
        message,
        type,
        relatedRequestId
      });
    }
  } catch (err) {
    console.error('[NotificationService] Error notifying hospital staff:', err);
  }
}

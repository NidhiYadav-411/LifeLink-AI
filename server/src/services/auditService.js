import { query } from '../database/db.js';

export async function logAudit({ userId = null, action, entityType, entityId = null, details = '', ipAddress = null }) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, detailsStr, ipAddress]
    );
  } catch (err) {
    console.error('[AuditService] Failed to record audit log:', err);
  }
}

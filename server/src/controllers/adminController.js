import { query } from '../database/db.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function listUsers(req, res, next) {
  try {
    const { role, status } = req.query;
    let sql = `
      SELECT u.id, u.email, u.role, u.full_name, u.phone, u.status, u.created_at,
             dp.blood_group, dp.city as donor_city, dp.is_available, dp.medical_eligibility_status,
             h.name as hospital_name, h.is_verified as hospital_is_verified
      FROM users u
      LEFT JOIN donor_profiles dp ON u.id = dp.user_id
      LEFT JOIN hospitals h ON u.id = h.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }
    if (status) {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY u.created_at DESC`;
    const users = await query(sql, params);
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function listHospitals(req, res, next) {
  try {
    const { verified } = req.query;
    let sql = `
      SELECT h.*, u.email as user_email, u.full_name as contact_person,
             v.full_name as verified_by_name
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      LEFT JOIN users v ON h.verified_by = v.id
      WHERE 1=1
    `;
    const params = [];

    if (verified !== undefined) {
      sql += ` AND h.is_verified = ?`;
      params.push(verified === 'true' || verified === '1' ? 1 : 0);
    }

    sql += ` ORDER BY h.created_at DESC`;
    const hospitals = await query(sql, params);
    res.json({ success: true, hospitals });
  } catch (err) {
    next(err);
  }
}

export async function verifyHospital(req, res, next) {
  try {
    const adminUser = req.user;
    const hospitalId = parseInt(req.params.id, 10);
    const { isVerified = true } = req.body;

    const hospRows = await query(`SELECT * FROM hospitals WHERE id = ?`, [hospitalId]);
    if (!hospRows || hospRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const verifiedVal = isVerified ? 1 : 0;
    await query(
      `UPDATE hospitals 
       SET is_verified = ?, verified_by = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [verifiedVal, isVerified ? adminUser.id : null, hospitalId]
    );

    await logAudit({
      userId: adminUser.id,
      action: verifiedVal ? 'HOSPITAL_VERIFIED' : 'HOSPITAL_UNVERIFIED',
      entityType: 'HOSPITAL',
      entityId: hospitalId,
      details: { verifiedBy: adminUser.full_name }
    });

    // Notify hospital user
    await createNotification({
      userId: hospRows[0].user_id,
      title: verifiedVal ? 'Hospital Verified' : 'Hospital Verification Status Changed',
      message: verifiedVal
        ? 'Your hospital registration has been officially verified. You can now authorize emergency blood requests.'
        : 'Your hospital verification status has been updated by administration.',
      type: 'INFO'
    });

    res.json({
      success: true,
      message: `Hospital successfully ${verifiedVal ? 'verified' : 'unverified'}.`
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await query(
      `SELECT a.*, u.full_name as user_name, u.email as user_email, u.role as user_role
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 100`
    );
    res.json({ success: true, auditLogs: logs });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformStats(req, res, next) {
  try {
    const [totalDonors] = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'DONOR'`);
    const [activeDonors] = await query(`SELECT COUNT(*) as count FROM donor_profiles WHERE is_available = 1`);
    const [totalRequests] = await query(`SELECT COUNT(*) as count FROM blood_requests`);
    const [fulfilledRequests] = await query(`SELECT COUNT(*) as count FROM blood_requests WHERE request_status = 'Fulfilled'`);
    const [activeHospitals] = await query(`SELECT COUNT(*) as count FROM hospitals WHERE is_verified = 1`);
    const [totalDonations] = await query(`SELECT COUNT(*) as count FROM donation_records`);

    res.json({
      success: true,
      stats: {
        totalDonors: totalDonors.count,
        activeDonors: activeDonors.count,
        totalRequests: totalRequests.count,
        fulfilledRequests: fulfilledRequests.count,
        activeHospitals: activeHospitals.count,
        totalDonations: totalDonations.count
      }
    });
  } catch (err) {
    next(err);
  }
}

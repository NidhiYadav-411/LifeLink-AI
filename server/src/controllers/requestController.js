import { query } from '../database/db.js';
import { validateBloodRequestInput, validateStatusTransition } from '../validators/requestValidators.js';
import { REQUEST_STATUS } from '../../../shared/constants/requestStatus.js';
import { ROLES } from '../../../shared/constants/roles.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function createRequest(req, res, next) {
  try {
    const user = req.user;
    const validation = validateBloodRequestInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const {
      hospitalName,
      hospitalId,
      requiredBloodGroup,
      bloodComponent = 'Whole Blood',
      unitsRequired = 1,
      urgencyLevel = 'Normal',
      requiredDatetime,
      description,
      latitude,
      longitude
    } = req.body;

    // Generate unique human-readable request code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestCode = `REQ-${new Date().getFullYear()}-${randomSuffix}`;

    // If request created by Hospital, it can be immediately 'Verified' if hospital is verified
    let verificationStatus = 'PENDING';
    let initialRequestStatus = 'Pending Verification';
    let verifiedBy = null;
    let verifiedAt = null;

    if (user.role === ROLES.HOSPITAL) {
      // Check if hospital is verified
      const hospRows = await query(`SELECT is_verified FROM hospitals WHERE user_id = ?`, [user.id]);
      if (hospRows && hospRows.length > 0 && hospRows[0].is_verified) {
        verificationStatus = 'VERIFIED';
        initialRequestStatus = 'Verified';
        verifiedBy = user.id;
        verifiedAt = new Date().toISOString();
      }
    } else if (user.role === ROLES.ADMIN) {
      verificationStatus = 'VERIFIED';
      initialRequestStatus = 'Verified';
      verifiedBy = user.id;
      verifiedAt = new Date().toISOString();
    }

    const insertRes = await query(
      `INSERT INTO blood_requests (
        request_code, creator_id, hospital_id, hospital_name, required_blood_group,
        blood_component, units_required, urgency_level, required_datetime, description,
        verification_status, verified_by, verified_at, request_status, current_search_radius_km,
        latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5, ?, ?)`,
      [
        requestCode,
        user.id,
        hospitalId || null,
        hospitalName.trim(),
        requiredBloodGroup,
        bloodComponent,
        parseInt(unitsRequired, 10),
        urgencyLevel,
        requiredDatetime,
        description || null,
        verificationStatus,
        verifiedBy,
        verifiedAt,
        initialRequestStatus,
        latitude || 40.7527,
        longitude || -73.9772
      ]
    );

    const requestId = insertRes.insertId;

    await logAudit({
      userId: user.id,
      action: 'BLOOD_REQUEST_CREATED',
      entityType: 'BLOOD_REQUEST',
      entityId: requestId,
      details: { requestCode, requiredBloodGroup, unitsRequired, urgencyLevel, verificationStatus }
    });

    // Notify user
    await createNotification({
      userId: user.id,
      title: `Blood Request ${requestCode} Created`,
      message: `Your request for ${unitsRequired} unit(s) of ${requiredBloodGroup} has been created with status "${initialRequestStatus}".`,
      type: 'INFO',
      relatedRequestId: requestId
    });

    const newReq = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully.',
      request: newReq[0]
    });
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const user = req.user;
    const { status, urgency, bloodGroup } = req.query;

    let sql = `
      SELECT r.*, u.full_name as creator_name, u.email as creator_email, u.phone as creator_phone,
             v.full_name as verified_by_name,
             (SELECT COUNT(*) FROM donor_matches WHERE request_id = r.id) as match_count,
             (SELECT COUNT(*) FROM donor_matches WHERE request_id = r.id AND status = 'ACCEPTED') as accepted_count
      FROM blood_requests r
      JOIN users u ON r.creator_id = u.id
      LEFT JOIN users v ON r.verified_by = v.id
      WHERE 1=1
    `;
    const params = [];

    // Role scoping
    if (user.role === ROLES.PATIENT) {
      sql += ` AND r.creator_id = ?`;
      params.push(user.id);
    } else if (user.role === ROLES.HOSPITAL) {
      // Hospitals see their hospital's requests + all verified critical/urgent requests
      sql += ` AND (r.creator_id = ? OR r.hospital_name LIKE ? OR r.verification_status = 'VERIFIED')`;
      params.push(user.id, `%${user.full_name}%`);
    } else if (user.role === ROLES.DONOR) {
      // Donors see verified active requests
      sql += ` AND r.verification_status = 'VERIFIED' AND r.request_status NOT IN ('Cancelled', 'Expired')`;
    }

    if (status) {
      sql += ` AND r.request_status = ?`;
      params.push(status);
    }
    if (urgency) {
      sql += ` AND r.urgency_level = ?`;
      params.push(urgency);
    }
    if (bloodGroup) {
      sql += ` AND r.required_blood_group = ?`;
      params.push(bloodGroup);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const requests = await query(sql, params);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const rows = await query(
      `SELECT r.*, u.full_name as creator_name, u.email as creator_email, u.phone as creator_phone,
              v.full_name as verified_by_name,
              h.name as hospital_official_name, h.address as hospital_address, h.contact_phone as hospital_phone
       FROM blood_requests r
       JOIN users u ON r.creator_id = u.id
       LEFT JOIN users v ON r.verified_by = v.id
       LEFT JOIN hospitals h ON r.hospital_id = h.id
       WHERE r.id = ?`,
      [requestId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blood request not found.' });
    }

    const request = rows[0];

    // Fetch matches with responses
    const matches = await query(
      `SELECT dm.*, u.full_name as donor_name, dp.blood_group as donor_blood_group, dp.city as donor_city,
              dr.response as donor_response, dr.response_notes, dr.responded_at
       FROM donor_matches dm
       JOIN users u ON dm.donor_id = u.id
       JOIN donor_profiles dp ON u.id = dp.user_id
       LEFT JOIN donor_responses dr ON dm.id = dr.match_id
       WHERE dm.request_id = ?
       ORDER BY dm.created_at DESC`,
      [requestId]
    );

    res.json({
      success: true,
      request,
      matches
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyRequest(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.id, 10);
    const { status = 'VERIFIED', notes } = req.body; // 'VERIFIED' or 'REJECTED'

    if (![ROLES.HOSPITAL, ROLES.ADMIN].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Only authorized hospital personnel or admins can verify requests.' });
    }

    const rows = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const newRequestStatus = status === 'VERIFIED' ? REQUEST_STATUS.VERIFIED : REQUEST_STATUS.CANCELLED;

    await query(
      `UPDATE blood_requests
       SET verification_status = ?,
           verified_by = ?,
           verified_at = CURRENT_TIMESTAMP,
           request_status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, user.id, newRequestStatus, requestId]
    );

    await logAudit({
      userId: user.id,
      action: `REQUEST_VERIFICATION_${status}`,
      entityType: 'BLOOD_REQUEST',
      entityId: requestId,
      details: { verifiedBy: user.full_name, status, notes }
    });

    // Notify creator
    await createNotification({
      userId: rows[0].creator_id,
      title: `Blood Request Verified: ${rows[0].request_code}`,
      message: `Your blood request has been officially verified by ${user.full_name}. Donor matching can now commence.`,
      type: 'VERIFICATION',
      relatedRequestId: requestId
    });

    const updated = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
    res.json({
      success: true,
      message: `Blood request has been marked as ${status}.`,
      request: updated[0]
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatus(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.id, 10);
    const { nextStatus, notes } = req.body;

    const rows = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    const current = rows[0];

    // Check transition validity
    const isValidTransition = validateStatusTransition(current.request_status, nextStatus);
    if (!isValidTransition && user.role !== ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${current.request_status}" to "${nextStatus}".`
      });
    }

    await query(
      `UPDATE blood_requests SET request_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextStatus, requestId]
    );

    // If marked FULFILLED, create donation record if matching donor accepted
    if (nextStatus === REQUEST_STATUS.FULFILLED) {
      const acceptedMatches = await query(
        `SELECT donor_id FROM donor_matches WHERE request_id = ? AND status = 'ACCEPTED'`,
        [requestId]
      );
      for (const m of acceptedMatches) {
        const certNum = `CERT-LL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        await query(
          `INSERT INTO donation_records (request_id, donor_id, hospital_id, units_donated, blood_group, blood_component, donation_date, verified_by, certificate_number)
           VALUES (?, ?, ?, 1, ?, ?, DATE('now'), ?, ?)`,
          [requestId, m.donor_id, current.hospital_id, current.required_blood_group, current.blood_component, user.id, certNum]
        );
        // Increment donor donation_count
        await query(`UPDATE donor_profiles SET donation_count = donation_count + 1, last_donation_date = DATE('now') WHERE user_id = ?`, [m.donor_id]);
      }
    }

    await logAudit({
      userId: user.id,
      action: 'REQUEST_STATUS_UPDATED',
      entityType: 'BLOOD_REQUEST',
      entityId: requestId,
      details: { from: current.request_status, to: nextStatus, notes }
    });

    // Notify creator
    await createNotification({
      userId: current.creator_id,
      title: `Request ${current.request_code} Status Updated`,
      message: `Status updated to: ${nextStatus}.`,
      type: 'STATUS_UPDATE',
      relatedRequestId: requestId
    });

    const updated = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
    res.json({
      success: true,
      message: `Request status updated to ${nextStatus}.`,
      request: updated[0]
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelRequest(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.id, 10);
    const { reason = 'Cancelled by user' } = req.body;

    const rows = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    const current = rows[0];

    // Creator, Hospital, or Admin can cancel
    if (user.role !== ROLES.ADMIN && current.creator_id !== user.id && user.role !== ROLES.HOSPITAL) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request.' });
    }

    await query(
      `UPDATE blood_requests SET request_status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [requestId]
    );

    await logAudit({
      userId: user.id,
      action: 'BLOOD_REQUEST_CANCELLED',
      entityType: 'BLOOD_REQUEST',
      entityId: requestId,
      details: { reason }
    });

    res.json({ success: true, message: 'Blood request cancelled successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function getRequestHistory(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const logs = await query(
      `SELECT a.*, u.full_name as user_name, u.role as user_role
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.entity_type = 'BLOOD_REQUEST' AND a.entity_id = ?
       ORDER BY a.created_at ASC`,
      [requestId]
    );

    res.json({ success: true, history: logs });
  } catch (err) {
    next(err);
  }
}

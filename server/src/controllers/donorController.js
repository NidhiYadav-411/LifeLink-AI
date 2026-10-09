import { query } from '../database/db.js';
import { validateDonorProfileUpdate } from '../validators/donorValidators.js';
import { recordDonorResponse } from '../services/matchingService.js';
import { logAudit } from '../services/auditService.js';

export async function getDonorProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const rows = await query(
      `SELECT u.id, u.email, u.full_name, u.phone,
              dp.id as profile_id, dp.blood_group, dp.city, dp.latitude, dp.longitude,
              dp.last_donation_date, dp.is_available, dp.medical_eligibility_status,
              dp.medical_notes, dp.donation_count, dp.created_at, dp.updated_at
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile not found.' });
    }

    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateDonorProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const validation = validateDonorProfileUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { fullName, phone, bloodGroup, city, latitude, longitude, lastDonationDate, medicalNotes } = req.body;

    if (fullName || phone) {
      await query(
        `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [fullName || null, phone || null, userId]
      );
    }

    await query(
      `UPDATE donor_profiles
       SET blood_group = COALESCE(?, blood_group),
           city = COALESCE(?, city),
           latitude = COALESCE(?, latitude),
           longitude = COALESCE(?, longitude),
           last_donation_date = COALESCE(?, last_donation_date),
           medical_notes = COALESCE(?, medical_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [bloodGroup || null, city || null, latitude || null, longitude || null, lastDonationDate || null, medicalNotes || null, userId]
    );

    await logAudit({
      userId,
      action: 'DONOR_PROFILE_UPDATED',
      entityType: 'DONOR_PROFILE',
      entityId: userId
    });

    const updated = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, dp.*
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated[0]
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAvailability(req, res, next) {
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;

    const availVal = isAvailable ? 1 : 0;
    await query(
      `UPDATE donor_profiles SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [availVal, userId]
    );

    await logAudit({
      userId,
      action: 'DONOR_AVAILABILITY_CHANGED',
      entityType: 'DONOR_PROFILE',
      entityId: userId,
      details: { isAvailable: availVal }
    });

    res.json({
      success: true,
      message: `Availability status set to ${availVal ? 'AVAILABLE' : 'UNAVAILABLE'}.`,
      isAvailable: availVal === 1
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncomingRequests(req, res, next) {
  try {
    const userId = req.user.id;

    // Get donor blood group
    const donorProfile = await query(`SELECT blood_group, city, latitude, longitude FROM donor_profiles WHERE user_id = ?`, [userId]);
    if (!donorProfile || donorProfile.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor profile missing.' });
    }
    const donor = donorProfile[0];

    // Fetch requests where this donor has been matched/contacted or active requests
    const matches = await query(
      `SELECT dm.id as match_id, dm.status as match_status, dm.contacted_at, dm.distance_km, dm.compatibility_reason,
              r.id as request_id, r.request_code, r.hospital_name, r.required_blood_group, r.blood_component,
              r.units_required, r.urgency_level, r.required_datetime, r.description, r.request_status,
              dr.response as donor_response, dr.response_notes, dr.responded_at
       FROM donor_matches dm
       JOIN blood_requests r ON dm.request_id = r.id
       LEFT JOIN donor_responses dr ON dm.id = dr.match_id
       WHERE dm.donor_id = ?
       ORDER BY dm.created_at DESC`,
      [userId]
    );

    res.json({ success: true, incomingRequests: matches });
  } catch (err) {
    next(err);
  }
}

export async function respondToRequest(req, res, next) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.requestId, 10);
    const { response, notes } = req.body;

    if (!['ACCEPTED', 'DECLINED'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Response must be ACCEPTED or DECLINED.' });
    }

    const result = await recordDonorResponse(requestId, userId, response, notes);
    res.json({
      success: true,
      message: `Successfully recorded your response: ${response}.`,
      result
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonationHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await query(
      `SELECT d.*, h.name as hospital_name, u.full_name as verified_by_name
       FROM donation_records d
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       LEFT JOIN users u ON d.verified_by = u.id
       WHERE d.donor_id = ?
       ORDER BY d.donation_date DESC`,
      [userId]
    );

    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
}

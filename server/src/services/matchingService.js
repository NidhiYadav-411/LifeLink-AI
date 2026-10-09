import { query } from '../database/db.js';
import { isBloodCompatible, getCompatibilityExplanation } from '../utils/compatibility.js';
import { calculateDistanceKm } from '../utils/geo.js';
import { createNotification } from './notificationService.js';
import { logAudit } from './auditService.js';

/**
 * Intelligent Donor Matching Engine
 * Identifies compatible donors for a specific blood request based on:
 * - Blood Group & Component Compatibility Matrix
 * - Donor Availability Status
 * - Medical Eligibility Review Status
 * - Geolocation Distance from Hospital within configured Radius
 */
export async function findCompatibleDonorsForRequest(requestId, radiusKm = 10) {
  // 1. Fetch the request details
  const requestRows = await query(
    `SELECT r.*, h.name as hospital_official_name, h.latitude as hosp_lat, h.longitude as hosp_lng
     FROM blood_requests r
     LEFT JOIN hospitals h ON r.hospital_id = h.id
     WHERE r.id = ?`,
    [requestId]
  );

  if (!requestRows || requestRows.length === 0) {
    throw new Error(`Blood request #${requestId} not found.`);
  }

  const request = requestRows[0];

  const hospLat = request.latitude || request.hosp_lat || 40.7527;
  const hospLng = request.longitude || request.hosp_lng || -73.9772;

  // 2. Fetch all active donors with their profile info
  const donorRows = await query(
    `SELECT u.id as user_id, u.full_name, u.email, u.phone,
            dp.id as profile_id, dp.blood_group, dp.city, dp.latitude, dp.longitude,
            dp.last_donation_date, dp.is_available, dp.medical_eligibility_status,
            dp.donation_count
     FROM users u
     JOIN donor_profiles dp ON u.id = dp.user_id
     WHERE u.role = 'DONOR' AND u.status = 'ACTIVE'`
  );

  // 3. Fetch existing matches for this request to include match status
  const existingMatches = await query(
    `SELECT donor_id, status, compatibility_reason, distance_km, contacted_at
     FROM donor_matches
     WHERE request_id = ?`,
    [requestId]
  );
  const matchMap = new Map();
  existingMatches.forEach(m => matchMap.set(m.donor_id, m));

  const candidates = [];

  for (const donor of donorRows) {
    // Check component compatibility
    const compatible = isBloodCompatible(donor.blood_group, request.required_blood_group, request.blood_component);
    if (!compatible) {
      continue;
    }

    // Check availability
    const isAvailable = donor.is_available === 1 || donor.is_available === true;
    if (!isAvailable) {
      continue;
    }

    // Check medical eligibility (must not be INELIGIBLE)
    if (donor.medical_eligibility_status === 'INELIGIBLE') {
      continue;
    }

    // Compute distance
    const donorLat = donor.latitude || 40.75;
    const donorLng = donor.longitude || -73.98;
    const distance = calculateDistanceKm(hospLat, hospLng, donorLat, donorLng);

    // Filter within the requested radius
    const isWithinRadius = radiusKm ? distance <= radiusKm : true;

    const explanation = getCompatibilityExplanation(donor.blood_group, request.required_blood_group, request.blood_component);

    // Calculate match score (100 base, penalty for distance)
    const distancePenalty = Math.min(30, Math.round(distance * 2));
    const matchScore = Math.max(50, 100 - distancePenalty);

    const existing = matchMap.get(donor.user_id);

    candidates.push({
      donorId: donor.user_id,
      fullName: donor.full_name,
      bloodGroup: donor.blood_group,
      city: donor.city,
      distanceKm: distance,
      isWithinRadius,
      matchScore,
      compatibilityReason: explanation,
      medicalEligibility: donor.medical_eligibility_status,
      lastDonationDate: donor.last_donation_date,
      donationCount: donor.donation_count,
      status: existing ? existing.status : 'IDENTIFIED',
      contactedAt: existing ? existing.contacted_at : null
    });
  }

  // Sort by within radius first, then by distance ascending
  candidates.sort((a, b) => {
    if (a.isWithinRadius && !b.isWithinRadius) return -1;
    if (!a.isWithinRadius && b.isWithinRadius) return 1;
    return a.distanceKm - b.distanceKm;
  });

  return {
    request: {
      id: request.id,
      requestCode: request.request_code,
      requiredBloodGroup: request.required_blood_group,
      bloodComponent: request.blood_component,
      unitsRequired: request.units_required,
      urgencyLevel: request.urgency_level,
      hospitalName: request.hospital_name,
      verificationStatus: request.verification_status,
      requestStatus: request.request_status,
      currentRadiusKm: radiusKm
    },
    candidates,
    totalCompatible: candidates.length,
    withinRadiusCount: candidates.filter(c => c.isWithinRadius).length
  };
}

/**
 * Initiate outreach to selected donor candidates for a verified blood request
 */
export async function initiateDonorOutreach(requestId, donorIds = [], initiatingUserId) {
  const reqRows = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
  if (!reqRows || reqRows.length === 0) {
    throw new Error('Blood request not found.');
  }
  const request = reqRows[0];

  if (request.verification_status !== 'VERIFIED') {
    throw new Error('Cannot initiate donor outreach on an unverified request.');
  }

  const results = [];

  for (const donorId of donorIds) {
    // Check if match entry already exists
    const existing = await query(
      `SELECT * FROM donor_matches WHERE request_id = ? AND donor_id = ?`,
      [requestId, donorId]
    );

    const donorInfo = await query(
      `SELECT u.full_name, dp.blood_group, dp.latitude, dp.longitude
       FROM users u
       JOIN donor_profiles dp ON u.id = dp.user_id
       WHERE u.id = ?`,
      [donorId]
    );

    if (!donorInfo || donorInfo.length === 0) continue;
    const d = donorInfo[0];

    const dist = calculateDistanceKm(
      request.latitude || 40.7527,
      request.longitude || -73.9772,
      d.latitude || 40.75,
      d.longitude || -73.98
    );
    const explanation = getCompatibilityExplanation(d.blood_group, request.required_blood_group, request.blood_component);

    if (existing && existing.length > 0) {
      await query(
        `UPDATE donor_matches 
         SET status = 'CONTACTED', contacted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO donor_matches (request_id, donor_id, compatibility_reason, distance_km, match_score, status, contacted_at)
         VALUES (?, ?, ?, ?, ?, 'CONTACTED', CURRENT_TIMESTAMP)`,
        [requestId, donorId, explanation, dist, 95]
      );
    }

    // Send high-priority in-app notification to donor
    await createNotification({
      userId: donorId,
      title: `URGENT Blood Request: ${request.required_blood_group} Needed`,
      message: `${request.hospital_name} needs ${request.units_required} unit(s) of ${request.required_blood_group} (${request.blood_component}). Urgency: ${request.urgency_level}. Please review and respond.`,
      type: request.urgency_level === 'Critical' ? 'URGENT' : 'MATCH',
      relatedRequestId: requestId
    });

    results.push({ donorId, status: 'CONTACTED' });
  }

  // Update request status to Searching for Donors if not already further along
  if (request.request_status === 'Verified' || request.request_status === 'Submitted') {
    await query(
      `UPDATE blood_requests SET request_status = 'Searching for Donors', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [requestId]
    );
  }

  await logAudit({
    userId: initiatingUserId,
    action: 'DONOR_OUTREACH_INITIATED',
    entityType: 'BLOOD_REQUEST',
    entityId: requestId,
    details: { contactedDonorCount: donorIds.length, donorIds }
  });

  return results;
}

/**
 * Record a donor's response (Accept or Decline)
 */
export async function recordDonorResponse(requestId, donorId, response, notes = '') {
  if (!['ACCEPTED', 'DECLINED'].includes(response)) {
    throw new Error('Invalid response. Must be ACCEPTED or DECLINED.');
  }

  // Ensure match record exists
  let matchRows = await query(
    `SELECT * FROM donor_matches WHERE request_id = ? AND donor_id = ?`,
    [requestId, donorId]
  );

  let matchId;
  if (!matchRows || matchRows.length === 0) {
    const res = await query(
      `INSERT INTO donor_matches (request_id, donor_id, compatibility_reason, distance_km, status, contacted_at)
       VALUES (?, ?, 'Direct donor response', 0, ?, CURRENT_TIMESTAMP)`,
      [requestId, donorId, response]
    );
    matchId = res.insertId;
  } else {
    matchId = matchRows[0].id;
    await query(
      `UPDATE donor_matches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [response, matchId]
    );
  }

  // Record response in donor_responses table
  const respRes = await query(
    `INSERT INTO donor_responses (match_id, request_id, donor_id, response, response_notes)
     VALUES (?, ?, ?, ?, ?)`,
    [matchId, requestId, donorId, response, notes]
  );

  // If response is ACCEPTED, update request status to 'Donor Response Received'
  if (response === 'ACCEPTED') {
    await query(
      `UPDATE blood_requests 
       SET request_status = 'Donor Response Received', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND request_status IN ('Searching for Donors', 'Verified')`,
      [requestId]
    );
  }

  // Notify hospital creator/staff
  const reqRows = await query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
  if (reqRows && reqRows.length > 0) {
    const req = reqRows[0];
    const donorRows = await query(`SELECT full_name, phone FROM users WHERE id = ?`, [donorId]);
    const donorName = donorRows[0]?.full_name || 'A donor';

    await createNotification({
      userId: req.creator_id,
      title: `Donor Response: ${response}`,
      message: `${donorName} has ${response.toLowerCase()} request ${req.request_code} (${req.required_blood_group}).`,
      type: 'STATUS_UPDATE',
      relatedRequestId: requestId
    });
  }

  await logAudit({
    userId: donorId,
    action: `DONOR_RESPONSE_${response}`,
    entityType: 'BLOOD_REQUEST',
    entityId: requestId,
    details: { response, notes }
  });

  return { success: true, matchId, response };
}

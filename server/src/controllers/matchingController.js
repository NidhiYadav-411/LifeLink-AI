import { query } from '../database/db.js';
import { findCompatibleDonorsForRequest, initiateDonorOutreach, recordDonorResponse } from '../services/matchingService.js';
import { ROLES } from '../../../shared/constants/roles.js';

export async function getCandidates(req, res, next) {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : 10;

    const result = await findCompatibleDonorsForRequest(requestId, radiusKm);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function initiateOutreach(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.requestId, 10);
    const { donorIds } = req.body;

    if (!donorIds || !Array.isArray(donorIds) || donorIds.length === 0) {
      return res.status(400).json({ success: false, message: 'donorIds array is required.' });
    }

    if (![ROLES.HOSPITAL, ROLES.ADMIN].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Only hospital personnel or admins can trigger donor outreach.' });
    }

    const outreachResults = await initiateDonorOutreach(requestId, donorIds, user.id);
    res.json({
      success: true,
      message: `Outreach initiated to ${donorIds.length} candidate(s).`,
      results: outreachResults
    });
  } catch (err) {
    next(err);
  }
}

export async function expandRadius(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.requestId, 10);
    const { nextRadiusKm } = req.body;

    if (!nextRadiusKm || ![5, 10, 25, 50].includes(parseInt(nextRadiusKm, 10))) {
      return res.status(400).json({ success: false, message: 'Radius must be 5, 10, 25, or 50 km.' });
    }

    await query(
      `UPDATE blood_requests SET current_search_radius_km = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [nextRadiusKm, requestId]
    );

    const candidates = await findCompatibleDonorsForRequest(requestId, nextRadiusKm);

    res.json({
      success: true,
      message: `Search radius successfully expanded to ${nextRadiusKm} km.`,
      currentRadiusKm: nextRadiusKm,
      ...candidates
    });
  } catch (err) {
    next(err);
  }
}

export async function handleDonorResponse(req, res, next) {
  try {
    const user = req.user;
    const requestId = parseInt(req.params.requestId, 10);
    const { response, notes } = req.body;

    const donorId = user.role === ROLES.DONOR ? user.id : req.body.donorId;
    if (!donorId) {
      return res.status(400).json({ success: false, message: 'donorId is required.' });
    }

    const result = await recordDonorResponse(requestId, donorId, response, notes);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

import express from 'express';
import {
  getCandidates,
  initiateOutreach,
  expandRadius,
  handleDonorResponse
} from '../controllers/matchingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../../../shared/constants/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/requests/:requestId/candidates', requireRole(ROLES.HOSPITAL, ROLES.ADMIN), getCandidates);
router.post('/requests/:requestId/outreach', requireRole(ROLES.HOSPITAL, ROLES.ADMIN), initiateOutreach);
router.post('/requests/:requestId/expand-radius', requireRole(ROLES.HOSPITAL, ROLES.ADMIN), expandRadius);
router.post('/requests/:requestId/response', handleDonorResponse);

export default router;

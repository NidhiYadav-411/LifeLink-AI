import express from 'express';
import {
  getDonorProfile,
  updateDonorProfile,
  updateAvailability,
  getIncomingRequests,
  respondToRequest,
  getDonationHistory
} from '../controllers/donorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../../../shared/constants/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', requireRole(ROLES.DONOR, ROLES.ADMIN), getDonorProfile);
router.put('/profile', requireRole(ROLES.DONOR, ROLES.ADMIN), updateDonorProfile);
router.patch('/availability', requireRole(ROLES.DONOR, ROLES.ADMIN), updateAvailability);
router.get('/incoming-requests', requireRole(ROLES.DONOR, ROLES.ADMIN), getIncomingRequests);
router.post('/requests/:requestId/respond', requireRole(ROLES.DONOR, ROLES.ADMIN), respondToRequest);
router.get('/history', requireRole(ROLES.DONOR, ROLES.ADMIN), getDonationHistory);

export default router;

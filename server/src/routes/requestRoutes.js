import express from 'express';
import {
  createRequest,
  listRequests,
  getRequestById,
  verifyRequest,
  updateRequestStatus,
  cancelRequest,
  getRequestHistory
} from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../../../shared/constants/roles.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listRequests);
router.post('/', requireRole(ROLES.PATIENT, ROLES.HOSPITAL, ROLES.ADMIN), createRequest);
router.get('/:id', getRequestById);
router.post('/:id/verify', requireRole(ROLES.HOSPITAL, ROLES.ADMIN), verifyRequest);
router.patch('/:id/status', requireRole(ROLES.HOSPITAL, ROLES.ADMIN), updateRequestStatus);
router.post('/:id/cancel', cancelRequest);
router.get('/:id/history', getRequestHistory);

export default router;

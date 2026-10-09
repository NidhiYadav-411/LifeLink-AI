import express from 'express';
import {
  listUsers,
  listHospitals,
  verifyHospital,
  getAuditLogs,
  getPlatformStats
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { ROLES } from '../../../shared/constants/roles.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

router.get('/users', listUsers);
router.get('/hospitals', listHospitals);
router.patch('/hospitals/:id/verify', verifyHospital);
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getPlatformStats);

export default router;

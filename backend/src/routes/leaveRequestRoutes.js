import express from 'express'
import {
  getAllLeaveRequests,
  getMyLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequestStatus
} from '../controllers/leaveRequestController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', requireRole('admin'), getAllLeaveRequests)
router.get('/my', requireRole('employee'), getMyLeaveRequests)
router.post('/', requireRole('employee'), createLeaveRequest)
router.put('/:id', requireRole('employee'), updateLeaveRequest)
router.delete('/:id', requireRole('employee'), deleteLeaveRequest)
router.patch('/:id/status', requireRole('admin'), updateLeaveRequestStatus)

export default router

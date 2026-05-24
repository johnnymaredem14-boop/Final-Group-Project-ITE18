import express from 'express'
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../controllers/leaveTypeController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'
const router = express.Router()
router.use(protect)
router.get('/', getLeaveTypes)
router.post('/', requireRole('admin'), createLeaveType)
router.put('/:id', requireRole('admin'), updateLeaveType)
router.delete('/:id', requireRole('admin'), deleteLeaveType)
export default router

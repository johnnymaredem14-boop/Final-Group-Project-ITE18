import express from 'express'
import {
  getMyEmployeeProfile,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/me', requireRole('employee'), getMyEmployeeProfile)

router.get('/', requireRole('admin'), getEmployees)
router.post('/', requireRole('admin'), createEmployee)
router.put('/:id', requireRole('admin'), updateEmployee)
router.delete('/:id', requireRole('admin'), deleteEmployee)

export default router

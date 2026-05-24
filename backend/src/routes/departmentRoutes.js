import express from 'express'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'
const router = express.Router()
router.use(protect)
router.get('/', getDepartments)
router.post('/', requireRole('admin'), createDepartment)
router.put('/:id', requireRole('admin'), updateDepartment)
router.delete('/:id', requireRole('admin'), deleteDepartment)
export default router

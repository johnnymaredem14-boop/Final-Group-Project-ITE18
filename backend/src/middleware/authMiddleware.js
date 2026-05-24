import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_secret_key')
    const [rows] = await pool.query(
      `SELECT users.id, users.name, users.email, users.role, departments.name AS department
       FROM users LEFT JOIN departments ON users.department_id = departments.id
       WHERE users.id = ?`, [decoded.id]
    )
    if (!rows.length) return res.status(401).json({ message: 'Invalid token user.' })
    req.user = rows[0]
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied. You do not have permission for this action.' })
  next()
}

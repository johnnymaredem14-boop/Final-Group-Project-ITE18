import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pool } from '../config/db.js'

const createToken = user =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'temporary_secret_key',
    { expiresIn: '1d' }
  )

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' })

  const [rows] = await pool.query(
    `SELECT users.id, users.name, users.email, users.password, users.role,
            departments.name AS department
     FROM users
     LEFT JOIN departments ON users.department_id = departments.id
     WHERE users.email = ?`,
    [email]
  )

  if (!rows.length)
    return res.status(401).json({ message: 'Invalid email or password.' })

  const user = rows[0]
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch)
    return res.status(401).json({ message: 'Invalid email or password.' })

  res.json({
    message: 'Login successful.',
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  })
}

export const getMe = (req, res) => res.json({ user: req.user })

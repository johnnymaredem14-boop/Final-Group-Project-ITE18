import bcrypt from 'bcrypt'
import { pool } from '../config/db.js'

const SALT_ROUNDS = 10

const employeeSelect = `
  SELECT 
    employees.id,
    users.name,
    users.email,
    departments.name AS department,
    departments.id AS departmentId,
    employees.leave_balance AS leaveBalance
  FROM employees
  INNER JOIN users ON employees.user_id = users.id
  INNER JOIN departments ON employees.department_id = departments.id
`

export const getMyEmployeeProfile = async (req, res) => {
  const [rows] = await pool.query(
    `${employeeSelect} WHERE users.id = ? LIMIT 1`, [req.user.id]
  )
  if (!rows.length) return res.status(404).json({ message: 'Employee profile not found.' })
  res.json(rows[0])
}

export const getEmployees = async (req, res) => {
  const [rows] = await pool.query(`${employeeSelect} ORDER BY employees.id DESC`)
  res.json(rows)
}

export const createEmployee = async (req, res) => {
  const { name, email, password, department } = req.body
  const leaveBalance = Number(req.body.leaveBalance ?? 0)

  if (!name || !email || !password || !department)
    return res.status(400).json({ message: 'Name, email, password, and department are required.' })

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [deptRows] = await connection.query('SELECT id FROM departments WHERE name = ?', [department])
    if (!deptRows.length) { await connection.rollback(); return res.status(404).json({ message: 'Department not found.' }) }

    const departmentId = deptRows[0].id

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) { await connection.rollback(); return res.status(409).json({ message: 'Email already exists.' }) }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'employee', departmentId]
    )

    const [empResult] = await connection.query(
      'INSERT INTO employees (user_id, department_id, leave_balance) VALUES (?, ?, ?)',
      [userResult.insertId, departmentId, leaveBalance]
    )

    await connection.commit()
    res.status(201).json({
      message: 'Employee created successfully.',
      employee: { id: empResult.insertId, name, email, department, leaveBalance }
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ message: 'Failed to create employee.', error: error.message })
  } finally {
    connection.release()
  }
}

export const updateEmployee = async (req, res) => {
  const id = Number(req.params.id)
  const { name, email, password, department } = req.body
  const leaveBalance = Number(req.body.leaveBalance ?? 0)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [empRows] = await connection.query('SELECT user_id FROM employees WHERE id = ?', [id])
    if (!empRows.length) { await connection.rollback(); return res.status(404).json({ message: 'Employee not found.' }) }

    const userId = empRows[0].user_id

    const [deptRows] = await connection.query('SELECT id FROM departments WHERE name = ?', [department])
    if (!deptRows.length) { await connection.rollback(); return res.status(404).json({ message: 'Department not found.' }) }

    const departmentId = deptRows[0].id

    const [emailCheck] = await connection.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId])
    if (emailCheck.length) { await connection.rollback(); return res.status(409).json({ message: 'Email already in use.' }) }

    // Only update password if a new one was provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      await connection.query(
        'UPDATE users SET name = ?, email = ?, password = ?, department_id = ? WHERE id = ?',
        [name, email, hashedPassword, departmentId, userId]
      )
    } else {
      await connection.query(
        'UPDATE users SET name = ?, email = ?, department_id = ? WHERE id = ?',
        [name, email, departmentId, userId]
      )
    }

    await connection.query(
      'UPDATE employees SET department_id = ?, leave_balance = ? WHERE id = ?',
      [departmentId, leaveBalance, id]
    )

    await connection.commit()
    res.json({ message: 'Employee updated successfully.', employee: { id, name, email, department, leaveBalance } })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ message: 'Failed to update employee.', error: error.message })
  } finally {
    connection.release()
  }
}

export const deleteEmployee = async (req, res) => {
  const id = Number(req.params.id)
  const [empRows] = await pool.query('SELECT user_id FROM employees WHERE id = ?', [id])
  if (!empRows.length) return res.status(404).json({ message: 'Employee not found.' })
  await pool.query('DELETE FROM users WHERE id = ?', [empRows[0].user_id])
  res.json({ message: 'Employee deleted successfully.' })
}

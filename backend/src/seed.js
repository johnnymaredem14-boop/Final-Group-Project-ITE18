/**
 * Database Seeder
 * ---------------
 * Run AFTER importing schema.sql and doing `npm install`.
 *
 * Usage:
 *   node src/seed.js
 *
 * This inserts seed users with properly hashed passwords.
 * Safe to re-run — it skips users that already exist.
 */

import bcrypt from 'bcrypt'
import { pool } from './config/db.js'

const SALT_ROUNDS = 10

const users = [
  { name: 'Admin User',     email: 'admin@gmail.com',    password: 'admin123',    role: 'admin',    department: null },
  { name: 'Juan Dela Cruz', email: 'employee@gmail.com', password: 'employee123', role: 'employee', department: 'HR' },
  { name: 'Maria Santos',   email: 'maria@gmail.com',    password: 'maria123',    role: 'employee', department: 'IT' },
]

const leaveRequests = [
  { userEmail: 'employee@gmail.com', leaveType: 'Vacation Leave', startDate: '2026-04-01', endDate: '2026-04-03', days: 3, reason: 'Family trip',          status: 'Pending'  },
  { userEmail: 'maria@gmail.com',    leaveType: 'Sick Leave',     startDate: '2026-03-20', endDate: '2026-03-21', days: 2, reason: 'Fever',                status: 'Approved' },
  { userEmail: 'employee@gmail.com', leaveType: 'Emergency Leave',startDate: '2026-02-15', endDate: '2026-02-15', days: 1, reason: 'Urgent family matter', status: 'Rejected' },
]

async function seed() {
  console.log('🌱 Seeding database...\n')

  for (const u of users) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email])
    if (existing.length) {
      console.log(`  ⏭  Skipping ${u.email} (already exists)`)
      continue
    }

    const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS)

    let departmentId = null
    if (u.department) {
      const [deptRows] = await pool.query('SELECT id FROM departments WHERE name = ?', [u.department])
      if (!deptRows.length) { console.error(`  ✗  Department "${u.department}" not found`); continue }
      departmentId = deptRows[0].id
    }

    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, hashedPassword, u.role, departmentId]
    )
    console.log(`  ✓  Created user: ${u.email} (${u.role})`)

    if (u.role === 'employee' && departmentId) {
      const leaveBalance = u.email === 'employee@gmail.com' ? 15 : 12
      await pool.query(
        'INSERT INTO employees (user_id, department_id, leave_balance) VALUES (?, ?, ?)',
        [userResult.insertId, departmentId, leaveBalance]
      )
      console.log(`     └─ Employee profile created (leave balance: ${leaveBalance})`)
    }
  }

  console.log('\n  Adding sample leave requests...')
  for (const lr of leaveRequests) {
    const [userRows]      = await pool.query('SELECT id FROM users WHERE email = ?', [lr.userEmail])
    const [leaveTypeRows] = await pool.query('SELECT id FROM leave_types WHERE name = ?', [lr.leaveType])
    if (!userRows.length || !leaveTypeRows.length) continue

    const [empRows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userRows[0].id])
    if (!empRows.length) continue

    const [existing] = await pool.query(
      'SELECT id FROM leave_requests WHERE employee_id = ? AND start_date = ? AND leave_type_id = ?',
      [empRows[0].id, lr.startDate, leaveTypeRows[0].id]
    )
    if (existing.length) { console.log(`  ⏭  Skipping leave request (already exists)`); continue }

    await pool.query(
      'INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, days, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [empRows[0].id, leaveTypeRows[0].id, lr.startDate, lr.endDate, lr.days, lr.reason, lr.status]
    )
    console.log(`  ✓  Leave request: ${lr.userEmail} – ${lr.leaveType} (${lr.status})`)
  }

  console.log('\n✅ Seeding complete!\n')
  console.log('Login credentials:')
  console.log('  admin@gmail.com    / admin123')
  console.log('  employee@gmail.com / employee123')
  console.log('  maria@gmail.com    / maria123\n')
  await pool.end()
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})

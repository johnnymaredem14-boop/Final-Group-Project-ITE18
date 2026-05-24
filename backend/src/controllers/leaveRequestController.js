import { pool } from '../config/db.js'
import { calculateDays, isPastDate } from '../utils/calculateDays.js'

const leaveRequestSelect = `
  SELECT
    leave_requests.id,
    users.email AS employeeEmail,
    users.name AS employee,
    departments.name AS department,
    leave_types.name AS leaveType,
    DATE_FORMAT(leave_requests.start_date, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(leave_requests.end_date, '%Y-%m-%d') AS endDate,
    leave_requests.days,
    leave_requests.reason,
    leave_requests.status
  FROM leave_requests
  INNER JOIN employees ON leave_requests.employee_id = employees.id
  INNER JOIN users ON employees.user_id = users.id
  INNER JOIN departments ON employees.department_id = departments.id
  INNER JOIN leave_types ON leave_requests.leave_type_id = leave_types.id
`

export const getAllLeaveRequests = async (req, res) => {
  const [rows] = await pool.query(`${leaveRequestSelect} ORDER BY leave_requests.id DESC`)
  res.json(rows)
}

export const getMyLeaveRequests = async (req, res) => {
  const [rows] = await pool.query(
    `${leaveRequestSelect} WHERE users.email = ? ORDER BY leave_requests.id DESC`,
    [req.user.email]
  )

  res.json(rows)
}

export const createLeaveRequest = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({
      message: 'Leave type, start date, end date, and reason are required.'
    })
  }

  if (isPastDate(startDate) || isPastDate(endDate)) {
    return res.status(400).json({
      message: 'You cannot file a leave request using a past date.'
    })
  }

  const days = calculateDays(startDate, endDate)

  if (days <= 0) {
    return res.status(400).json({
      message: 'End date must be the same as or later than the start date.'
    })
  }

  const [employeeRows] = await pool.query(
    'SELECT id, leave_balance AS leaveBalance FROM employees WHERE user_id = ?',
    [req.user.id]
  )

  if (!employeeRows.length) {
    return res.status(404).json({
      message: 'Employee record not found.'
    })
  }

  if (employeeRows[0].leaveBalance < days) {
    return res.status(400).json({
      message: 'Insufficient leave balance for the requested number of days.'
    })
  }

  const [leaveTypeRows] = await pool.query(
    'SELECT id FROM leave_types WHERE name = ?',
    [leaveType]
  )

  if (!leaveTypeRows.length) {
    return res.status(404).json({
      message: 'Leave type not found.'
    })
  }

  const [result] = await pool.query(
    `INSERT INTO leave_requests 
      (employee_id, leave_type_id, start_date, end_date, days, reason, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
    [employeeRows[0].id, leaveTypeRows[0].id, startDate, endDate, days, reason]
  )

  res.status(201).json({
    message: 'Leave request submitted successfully.',
    leaveRequest: {
      id: result.insertId,
      employeeEmail: req.user.email,
      employee: req.user.name,
      department: req.user.department,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'Pending'
    }
  })
}

export const updateLeaveRequest = async (req, res) => {
  const id = Number(req.params.id)
  const { leaveType, startDate, endDate, reason } = req.body

  const [requestRows] = await pool.query(
    `SELECT 
      leave_requests.id,
      leave_requests.status,
      leave_requests.employee_id,
      employees.user_id,
      employees.leave_balance AS leaveBalance
    FROM leave_requests
    INNER JOIN employees ON leave_requests.employee_id = employees.id
    WHERE leave_requests.id = ?`,
    [id]
  )

  if (!requestRows.length) {
    return res.status(404).json({
      message: 'Leave request not found.'
    })
  }

  if (requestRows[0].user_id !== req.user.id) {
    return res.status(403).json({
      message: 'You can only update your own leave requests.'
    })
  }

  if (requestRows[0].status !== 'Pending') {
    return res.status(400).json({
      message: 'Only pending leave requests can be updated.'
    })
  }

  if (isPastDate(startDate) || isPastDate(endDate)) {
    return res.status(400).json({
      message: 'You cannot update a leave request using a past date.'
    })
  }

  const days = calculateDays(startDate, endDate)

  if (days <= 0) {
    return res.status(400).json({
      message: 'End date must be the same as or later than the start date.'
    })
  }

  if (requestRows[0].leaveBalance < days) {
    return res.status(400).json({
      message: 'Insufficient leave balance for the requested number of days.'
    })
  }

  const [leaveTypeRows] = await pool.query(
    'SELECT id FROM leave_types WHERE name = ?',
    [leaveType]
  )

  if (!leaveTypeRows.length) {
    return res.status(404).json({
      message: 'Leave type not found.'
    })
  }

  await pool.query(
    `UPDATE leave_requests 
     SET leave_type_id = ?, start_date = ?, end_date = ?, days = ?, reason = ?
     WHERE id = ?`,
    [leaveTypeRows[0].id, startDate, endDate, days, reason, id]
  )

  res.json({
    message: 'Leave request updated successfully.'
  })
}

export const deleteLeaveRequest = async (req, res) => {
  const id = Number(req.params.id)

  const [requestRows] = await pool.query(
    `SELECT 
      leave_requests.id,
      leave_requests.status,
      employees.user_id
    FROM leave_requests
    INNER JOIN employees ON leave_requests.employee_id = employees.id
    WHERE leave_requests.id = ?`,
    [id]
  )

  if (!requestRows.length) {
    return res.status(404).json({
      message: 'Leave request not found.'
    })
  }

  if (requestRows[0].user_id !== req.user.id) {
    return res.status(403).json({
      message: 'You can only delete your own leave requests.'
    })
  }

  if (requestRows[0].status !== 'Pending') {
    return res.status(400).json({
      message: 'Only pending leave requests can be cancelled.'
    })
  }

  await pool.query('DELETE FROM leave_requests WHERE id = ?', [id])

  res.json({
    message: 'Leave request cancelled successfully.'
  })
}

export const updateLeaveRequestStatus = async (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be Approved or Rejected.'
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [requestRows] = await connection.query(
      `SELECT 
        leave_requests.id,
        leave_requests.status,
        leave_requests.days,
        leave_requests.employee_id,
        employees.leave_balance AS leaveBalance
      FROM leave_requests
      INNER JOIN employees ON leave_requests.employee_id = employees.id
      WHERE leave_requests.id = ?
      FOR UPDATE`,
      [id]
    )

    if (!requestRows.length) {
      await connection.rollback()
      return res.status(404).json({
        message: 'Leave request not found.'
      })
    }

    const request = requestRows[0]

    if (request.status !== 'Pending') {
      await connection.rollback()
      return res.status(400).json({
        message: 'Only pending requests can be approved or rejected.'
      })
    }

    if (status === 'Approved') {
      if (request.leaveBalance < request.days) {
        await connection.rollback()
        return res.status(400).json({
          message: 'Cannot approve request. Employee has insufficient leave balance.'
        })
      }

      await connection.query(
        'UPDATE employees SET leave_balance = leave_balance - ? WHERE id = ?',
        [request.days, request.employee_id]
      )
    }

    await connection.query(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      [status, id]
    )

    await connection.commit()

    res.json({
      message:
        status === 'Approved'
          ? `Leave request approved. ${request.days} day(s) deducted from employee leave balance.`
          : 'Leave request rejected successfully.'
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({
      message: 'Failed to update leave request status.',
      error: error.message
    })
  } finally {
    connection.release()
  }
}

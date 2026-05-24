import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import authRoutes from './routes/authRoutes.js'
import employeeRoutes from './routes/employeeRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import leaveTypeRoutes from './routes/leaveTypeRoutes.js'
import leaveRequestRoutes from './routes/leaveRequestRoutes.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'Employee Leave Management System Backend API is running.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/leave-types', leaveTypeRoutes)
app.use('/api/leave-requests', leaveRequestRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

export default app

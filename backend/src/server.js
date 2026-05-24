import dotenv from 'dotenv'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`Employee Leave Management System API running on port ${PORT}`)
})

server.on('error', error => {
  console.error('Server error:', error)
})

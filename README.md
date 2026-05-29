# Employee Leave Management System 

This version uses Vue.js frontend, Express backend, and MySQL database.

## MySQL Setup with Laragon

1. Start Laragon MySQL.
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Import: `backend/database/schema.sql`

## Run Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000



## Admin Approval Flow

Approve and Reject remain inside the Manage Requests page. The Admin Dashboard only displays the recent leave request summary and status.


## Leave Credit Deduction Update

When an admin approves a pending leave request, the system automatically deducts the requested number of days from the employee's leave balance.

Example:

```txt
Leave balance: 15 days
Approved request: 3 days
Updated balance: 12 days
```

The backend prevents approval if the employee does not have enough leave balance.

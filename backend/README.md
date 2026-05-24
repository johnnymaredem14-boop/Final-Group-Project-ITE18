# ELMS Backend

## Setup (localhost)

### 1. Import the database schema
Open phpMyAdmin → SQL tab → paste and run `database/schema.sql`.  
This creates the `elms_db` database, all tables, departments, and leave types.

### 2. Install dependencies
```bash
npm install
```

### 3. Seed the database with hashed passwords
```bash
npm run seed
```
This inserts the three seed users with **bcrypt-hashed** passwords.  
You will see hashed values in phpMyAdmin (not plain text) — that is correct.

**Login credentials:**
| Email | Password |
|---|---|
| admin@gmail.com | admin123 |
| employee@gmail.com | employee123 |
| maria@gmail.com | maria123 |

### 4. Start the server
```bash
npm run dev
```
Server runs on `http://localhost:3000` (or whatever port is set).

---

## Notes
- No `.env` file needed — defaults are `localhost / root / (no password) / elms_db`.
- `npm run seed` is safe to re-run; it skips existing users.

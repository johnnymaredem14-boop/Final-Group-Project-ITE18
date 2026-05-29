
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

const users = [
  { label: 'admin@gmail.com    (admin123)',    plain: 'admin123' },
  { label: 'employee@gmail.com (employee123)', plain: 'employee123' },
  { label: 'maria@gmail.com    (maria123)',    plain: 'maria123' },
]

for (const u of users) {
  const hash = await bcrypt.hash(u.plain, SALT_ROUNDS)
  console.log(`${u.label}\n  -> ${hash}\n`)
}

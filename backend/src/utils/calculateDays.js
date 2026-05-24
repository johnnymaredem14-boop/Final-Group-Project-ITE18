export const todayDateString = () => new Date().toISOString().split('T')[0]
export const isPastDate = dateValue => dateValue < todayDateString()
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
  const difference = end - start
  if (difference < 0) return 0
  return difference / (1000 * 60 * 60 * 24) + 1
}

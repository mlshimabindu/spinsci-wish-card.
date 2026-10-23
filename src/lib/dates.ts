export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Calendar day a birthday or anniversary is marked, shifting 29 February to 28 February in non-leap years. */
export function celebrateDay(month: number, day: number, year: number): Date {
  const clampedMonth = Math.min(12, Math.max(1, Math.trunc(month)))
  if (clampedMonth === 2 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28)
  }
  const daysInMonth = new Date(year, clampedMonth, 0).getDate()
  const clampedDay = Math.min(Math.max(1, Math.trunc(day)), daysInMonth)
  return new Date(year, clampedMonth - 1, clampedDay)
}

export function isLeapShifted(month: number, day: number, year: number): boolean {
  return month === 2 && day === 29 && !isLeapYear(year)
}

export function daysUntil(target: Date, from: Date): number {
  const ms = startOfDay(target).getTime() - startOfDay(from).getTime()
  return Math.round(ms / 86_400_000)
}

export function nextBirthday(month: number, day: number, from: Date): Date {
  const today = startOfDay(from)
  let date = celebrateDay(month, day, today.getFullYear())
  if (date < today) date = celebrateDay(month, day, today.getFullYear() + 1)
  return date
}

export function anniversaryOn(
  startISO: string,
  year: number,
): { date: Date; years: number } | null {
  const start = parseISODate(startISO)
  if (!start) return null
  const years = year - start.getFullYear()
  if (years < 1) return null
  return {
    date: celebrateDay(start.getMonth() + 1, start.getDate(), year),
    years,
  }
}

export function nextAnniversary(
  startISO: string,
  from: Date,
): { date: Date; years: number } | null {
  const start = parseISODate(startISO)
  if (!start) return null
  const today = startOfDay(from)
  let year = Math.max(today.getFullYear(), start.getFullYear() + 1)
  let date = celebrateDay(start.getMonth() + 1, start.getDate(), year)
  if (date < today) {
    year += 1
    date = celebrateDay(start.getMonth() + 1, start.getDate(), year)
  }
  const years = year - start.getFullYear()
  if (years < 1) return null
  return { date, years }
}

export function daysInBirthdayMonth(month: number): number {
  if (month === 2) return 29
  if ([4, 6, 9, 11].includes(month)) return 30
  if (month >= 1 && month <= 12) return 31
  return 31
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatWeekdayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatMonthDay(month: number, day: number): string {
  const date = new Date(2024, month - 1, day)
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return `${day}/${month}`
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(date)
}

export function formatRelative(days: number): string {
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days > 1) return `In ${days} days`
  if (days === -1) return "Yesterday"
  return `${Math.abs(days)} days ago`
}

export function yearsLabel(years: number): string {
  return years === 1 ? "1 year" : `${years} years`
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name.trim()
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => [...part][0] ?? "").join("")
  return letters.toLocaleUpperCase("en-US") || "?"
}

/** Use the accent for small text only when it stays readable on cream paper. */
export function readableAccent(hex: string): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!match) return "#1c1712"
  const value = Number.parseInt(match[1], 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance > 170 ? "#1c1712" : `#${match[1].toLowerCase()}`
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim())
}

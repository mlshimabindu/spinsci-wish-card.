import { daysUntil, nextAnniversary, nextBirthday } from "@/lib/dates"
import type { Board, BoardKind, Person } from "@/lib/types"

export type Occasion = {
  person: Person
  kind: BoardKind
  date: Date
  years: number | null
  daysUntil: number
}

export function upcomingOccasions(people: Person[], from: Date, withinDays: number): Occasion[] {
  const items: Occasion[] = []
  for (const person of people) {
    const birthday = nextBirthday(person.birthdayMonth, person.birthdayDay, from)
    const birthdayDays = daysUntil(birthday, from)
    if (birthdayDays <= withinDays) {
      items.push({ person, kind: "birthday", date: birthday, years: null, daysUntil: birthdayDays })
    }
    const anniversary = nextAnniversary(person.startDate, from)
    if (anniversary) {
      const anniversaryDays = daysUntil(anniversary.date, from)
      if (anniversaryDays <= withinDays) {
        items.push({
          person,
          kind: "anniversary",
          date: anniversary.date,
          years: anniversary.years,
          daysUntil: anniversaryDays,
        })
      }
    }
  }
  return items.sort((left, right) => {
    if (left.daysUntil !== right.daysUntil) return left.daysUntil - right.daysUntil
    const byName = left.person.name.localeCompare(right.person.name)
    if (byName !== 0) return byName
    if (left.kind === right.kind) return 0
    return left.kind === "birthday" ? -1 : 1
  })
}

export function findBoard(boards: Board[], personId: string, kind: BoardKind, year: number): Board | undefined {
  return boards.find((board) => board.personId === personId && board.kind === kind && board.year === year)
}

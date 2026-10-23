import { anniversaryOn, celebrateDay, isLeapShifted } from "@/lib/dates"
import { formatDate } from "@/lib/format"
import type { Board, Person } from "@/lib/types"

export type CardModel = {
  personName: string
  role: string
  team: string
  kind: Board["kind"]
  year: number
  years: number | null
  dateLabel: string
  leapNote: string | null
  message: string
  photoDataUrl: string | null
  missingPerson: boolean
}

export function cardModel(board: Board, people: Person[]): CardModel {
  const person = people.find((item) => item.id === board.personId) ?? null
  if (!person) {
    return {
      personName: "Person removed",
      role: "This person is no longer in the directory",
      team: "",
      kind: board.kind,
      year: board.year,
      years: null,
      dateLabel: String(board.year),
      leapNote: null,
      message: board.message,
      photoDataUrl: board.imageDataUrl,
      missingPerson: true,
    }
  }

  if (board.kind === "anniversary") {
    const occasion = anniversaryOn(person.startDate, board.year)
    const shifted = isLeapShifted(
      Number(person.startDate.slice(5, 7)),
      Number(person.startDate.slice(8, 10)),
      board.year,
    )
    return {
      personName: person.name,
      role: person.role,
      team: person.team,
      kind: board.kind,
      year: board.year,
      years: occasion?.years ?? null,
      dateLabel: occasion ? formatDate(occasion.date) : String(board.year),
      leapNote: shifted ? "29 February is marked on 28 February this year." : null,
      message: board.message,
      photoDataUrl: board.imageDataUrl ?? person.photoDataUrl,
      missingPerson: false,
    }
  }

  const date = celebrateDay(person.birthdayMonth, person.birthdayDay, board.year)
  return {
    personName: person.name,
    role: person.role,
    team: person.team,
    kind: board.kind,
    year: board.year,
    years: null,
    dateLabel: formatDate(date),
    leapNote: isLeapShifted(person.birthdayMonth, person.birthdayDay, board.year)
      ? "29 February is marked on 28 February this year."
      : null,
    message: board.message,
    photoDataUrl: board.imageDataUrl ?? person.photoDataUrl,
    missingPerson: false,
  }
}

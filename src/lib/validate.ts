import { anniversaryOn, daysInBirthdayMonth, parseISODate, startOfDay } from "@/lib/dates"
import type { BoardKind, Person } from "@/lib/types"
import { firstName } from "@/lib/format"

export type FieldErrors = Record<string, string>

export type PersonDraft = {
  id: string
  name: string
  role: string
  team: string
  photoDataUrl: string | null
  birthdayMonth: string
  birthdayDay: string
  startDate: string
}

export function validatePerson(draft: PersonDraft, today: Date): FieldErrors {
  const errors: FieldErrors = {}
  const name = draft.name.trim()
  const role = draft.role.trim()
  const team = draft.team.trim()

  if (name.length < 2) errors.name = "Enter a name with at least 2 characters."
  else if (name.length > 80) errors.name = "Keep the name to 80 characters or fewer."

  if (!role) errors.role = "Enter a role."
  else if (role.length > 60) errors.role = "Keep the role to 60 characters or fewer."

  if (!team) errors.team = "Enter a team."
  else if (team.length > 60) errors.team = "Keep the team to 60 characters or fewer."

  const month = Number(draft.birthdayMonth)
  const day = Number(draft.birthdayDay)
  if (!draft.birthdayMonth || !Number.isInteger(month) || month < 1 || month > 12) {
    errors.birthdayMonth = "Choose a birthday month."
  } else if (!draft.birthdayDay || !Number.isInteger(day) || day < 1 || day > daysInBirthdayMonth(month)) {
    errors.birthdayDay = "Choose a valid birthday day."
  }

  const start = parseISODate(draft.startDate)
  if (!start) errors.startDate = "Enter a valid start date."
  else if (startOfDay(start) > startOfDay(today)) {
    errors.startDate = "Start date cannot be in the future."
  }

  return errors
}

export function personFromDraft(draft: PersonDraft): Person {
  return {
    id: draft.id,
    name: draft.name.trim(),
    role: draft.role.trim(),
    team: draft.team.trim(),
    photoDataUrl: draft.photoDataUrl,
    birthdayMonth: Number(draft.birthdayMonth),
    birthdayDay: Number(draft.birthdayDay),
    startDate: draft.startDate,
  }
}

export function validateBoard(input: {
  person: Person | undefined
  kind: BoardKind
  year: number
  message: string
  imageSource: "profile" | "custom"
  customImage: string | null
}): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.person) errors.person = "Choose a person."

  const message = input.message.trim()
  if (!message) errors.message = "Write a wish before saving the board."
  else if (message.length > 400) errors.message = "Keep the wish to 400 characters or fewer."

  if (!Number.isInteger(input.year) || input.year < 1990 || input.year > 2100) {
    errors.year = "Choose a valid year."
  } else if (input.person) {
    const start = parseISODate(input.person.startDate)
    if (start && input.year < start.getFullYear()) {
      errors.year = "That year is before their start date."
    } else if (input.kind === "anniversary" && !anniversaryOn(input.person.startDate, input.year)) {
      errors.year = `${firstName(input.person.name)} has not completed a year by ${input.year}.`
    }
  }

  if (input.imageSource === "custom" && !input.customImage) {
    errors.image = "Upload a photo, or use the profile photo."
  }

  return errors
}

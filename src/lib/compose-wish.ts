import type { WishKind } from "@/lib/wish-image"

export type ComposedWish = {
  headline: string
  body: string
  signoff: string
}

const SIGN_OFF = "From the SpinSci team"

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ""
}

function polishNote(note: string): string {
  const text = note.trim().replace(/\s+/g, " ")
  if (!text) return ""
  const capitalized = /^[a-z]/.test(text) ? text.charAt(0).toUpperCase() + text.slice(1) : text
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function headlineFor(kind: WishKind, person: string): string {
  if (kind === "birthday") return person ? `Happy birthday, ${person}` : "Happy birthday"
  if (kind === "anniversary") return person ? `Happy work anniversary, ${person}` : "Happy work anniversary"
  return person ? `Thank you, ${person}` : "With appreciation"
}

function closingFor(kind: WishKind): string {
  if (kind === "birthday") return "Wishing you a wonderful day."
  if (kind === "anniversary") return "Thank you for another year at SpinSci."
  return "We are grateful to have you on the team."
}

function defaultBody(kind: WishKind): string {
  if (kind === "birthday") return "Wishing you a wonderful day, and a year that feels as good as the one you give this team."
  if (kind === "anniversary") return "Thank you for another year at SpinSci. We are glad you are here."
  return "Thank you for the care you bring to this team. We are grateful."
}

export function composeTeamWish(input: { kind: WishKind; name: string; note: string }): ComposedWish {
  const person = firstName(input.name)
  const note = polishNote(input.note)
  const headline = headlineFor(input.kind, person)
  if (!note) return { headline, body: defaultBody(input.kind), signoff: SIGN_OFF }
  if (wordCount(note) >= 16) return { headline, body: note, signoff: SIGN_OFF }
  return { headline, body: `${note} ${closingFor(input.kind)}`, signoff: SIGN_OFF }
}

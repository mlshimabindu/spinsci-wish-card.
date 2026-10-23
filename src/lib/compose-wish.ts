import type { WishKind } from "@/lib/wish-image"

export type ComposedWish = {
  headline: string
  body: string
  signoff: string
}

const SIGN_OFF = "From the SpinSci team"

function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? ""
  if (!first) return ""
  if (/[a-z]/.test(first) && /[A-Z]/.test(first)) return first
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

function polishParagraph(paragraph: string): string {
  let text = paragraph.trim().replace(/[ \t]+/g, " ")
  if (!text) return ""
  const letters = text.replace(/[^A-Za-z]/g, "")
  if (letters.length >= 3 && letters === letters.toUpperCase()) text = text.toLowerCase()
  text = text.replace(/([.!?])([A-Za-z])/g, "$1 $2")
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead: string, letter: string) => lead + letter.toUpperCase())
  text = text.replace(/\bi(?:'(?:m|ve|ll|d|re))?\b/gi, (match) => {
    const lower = match.toLowerCase()
    return lower === "i" ? "I" : `I${lower.slice(1)}`
  })
  text = text.replace(/\bspinsci\b/gi, "SpinSci")
  text = text.replace(/\s+([,.;!?])/g, "$1")
  text = text.replace(/\.{2,}/g, ".")
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function polishNote(note: string): string {
  return note
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map(polishParagraph)
    .filter(Boolean)
    .join("\n\n")
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function headlineFor(kind: WishKind, person: string): string {
  if (kind === "birthday") return person ? `Happy Birthday, ${person}` : "Happy Birthday"
  if (kind === "anniversary") return person ? `Happy Work Anniversary, ${person}` : "Happy Work Anniversary"
  return person ? `Thank You, ${person}` : "With Appreciation"
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
  return { headline, body: `${note}\n\n${closingFor(input.kind)}`, signoff: SIGN_OFF }
}

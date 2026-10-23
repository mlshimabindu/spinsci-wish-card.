import type { BoardKind, Brand, Person } from "@/lib/types"
import { firstName, yearsLabel } from "@/lib/format"

export const BIRTHDAY_TEMPLATES = [
  "Happy birthday, {first}. Thank you for the care you bring to {team}.",
  "Wishing you a bright birthday, {first}. {company} is better with you in it.",
  "{first}, today is yours. Happy birthday from everyone at {company}.",
] as const

export const ANNIVERSARY_TEMPLATES = [
  "{years} at {company}. Thank you, {first}, for the work you put in.",
  "Happy work anniversary, {first}. {years} with {team}.",
  "{first}, {years} of showing up for {company}. We are glad you are here.",
] as const

const TOKEN = /\{(name|first|company|years|role|team)\}/g

export function fillTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(TOKEN, (_, key: string) => values[key] ?? "")
}

export function messageValues(
  person: Pick<Person, "name" | "role" | "team">,
  brand: Pick<Brand, "companyName">,
  years: number | null,
): Record<string, string> {
  return {
    name: person.name.trim(),
    first: firstName(person.name),
    company: brand.companyName.trim() || "the company",
    years: yearsLabel(years ?? 0),
    role: person.role.trim(),
    team: person.team.trim(),
  }
}

export function defaultMessage(
  kind: BoardKind,
  person: Pick<Person, "name" | "role" | "team">,
  brand: Pick<Brand, "companyName">,
  years: number | null,
): string {
  const template =
    kind === "birthday" ? BIRTHDAY_TEMPLATES[0] : ANNIVERSARY_TEMPLATES[0]
  return fillTemplate(template, messageValues(person, brand, years))
}

export function templatesFor(kind: BoardKind): readonly string[] {
  return kind === "birthday" ? BIRTHDAY_TEMPLATES : ANNIVERSARY_TEMPLATES
}

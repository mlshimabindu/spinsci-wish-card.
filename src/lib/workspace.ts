import { daysInBirthdayMonth, parseISODate } from "@/lib/dates"
import { initials } from "@/lib/format"
import { initialsAvatar, isImageDataUrl, starLogo } from "@/lib/images"
import { defaultMessage } from "@/lib/messages"
import type { Board, BoardKind, Brand, Person, Workspace } from "@/lib/types"
import { DEFAULT_ACCENT } from "@/lib/types"

export const STORAGE_KEY = "merriday-boards.v1"

export type KeyValueStore = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

const PHOTO_COLORS = ["#1f4d45", "#c4553a", "#244c8a", "#8a6232", "#7a3e66", "#3d4a3a", "#6b4a2d", "#345c6e"]

function photoFor(name: string, index: number): string {
  return initialsAvatar(initials(name), PHOTO_COLORS[index % PHOTO_COLORS.length] ?? "#1f4d45")
}

function person(
  id: string,
  name: string,
  role: string,
  team: string,
  birthdayMonth: number,
  birthdayDay: number,
  startDate: string,
  index: number,
): Person {
  return {
    id,
    name,
    role,
    team,
    photoDataUrl: photoFor(name, index),
    birthdayMonth,
    birthdayDay,
    startDate,
  }
}

export function createSeedWorkspace(): Workspace {
  const brand: Brand = {
    companyName: "Northline",
    motto: "Celebrating our people.",
    logoDataUrl: starLogo(),
    accent: DEFAULT_ACCENT,
  }
  const people: Person[] = [
    person("p-jonah", "Jonah Ellison", "People Partner", "People", 10, 23, "2021-06-02", 0),
    person("p-rafael", "Rafael Costa", "IT Support", "Technology", 12, 19, "2022-10-23", 1),
    person("p-priya", "Priya Raman", "Clinical Admin", "Care Delivery", 10, 24, "2020-10-24", 2),
    person("p-hana", "Hana Okonkwo", "Benefits Specialist", "People", 10, 28, "2020-04-16", 3),
    person("p-amira", "Amira Solano", "Staff Nurse", "Inpatient", 6, 12, "2018-11-02", 4),
    person("p-meera", "Meera Iyer", "Operations Lead", "Care Delivery", 3, 14, "2019-06-01", 5),
    person("p-leo", "Leo Park", "Facilities Coordinator", "Workplace", 1, 9, "2024-02-20", 6),
    person("p-sable", "Sable Quinn", "Reception", "Workplace", 4, 2, "2026-09-01", 7),
  ]
  const byId = Object.fromEntries(people.map((item) => [item.id, item])) as Record<string, Person>

  const board = (
    id: string,
    personId: string,
    kind: BoardKind,
    year: number,
    pinned: boolean,
    createdAt: string,
  ): Board => {
    const employee = byId[personId]
    if (!employee) throw new Error(`Missing seed person ${personId}`)
    const years = kind === "anniversary" ? year - Number(employee.startDate.slice(0, 4)) : null
    return {
      id,
      personId,
      kind,
      year,
      message: defaultMessage(kind, employee, brand, years),
      imageDataUrl: null,
      pinned,
      createdAt,
    }
  }

  return {
    brand,
    people,
    boards: [
      board("b-jonah-2026", "p-jonah", "birthday", 2026, true, "2026-10-20T09:00:00.000Z"),
      board("b-rafael-2026", "p-rafael", "anniversary", 2026, true, "2026-10-20T09:05:00.000Z"),
      board("b-priya-bday-2026", "p-priya", "birthday", 2026, false, "2026-10-21T09:00:00.000Z"),
      board("b-priya-ann-2026", "p-priya", "anniversary", 2026, false, "2026-10-21T09:05:00.000Z"),
    ],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const text = value.trim()
  if (!text || text.length > max) return null
  return text
}

function cleanPerson(value: unknown): Person | null {
  if (!isRecord(value)) return null
  const id = cleanText(value.id, 80)
  const name = cleanText(value.name, 80)
  const role = cleanText(value.role, 60)
  const team = cleanText(value.team, 60)
  const startDate = typeof value.startDate === "string" ? value.startDate : ""
  const birthdayMonth = value.birthdayMonth
  const birthdayDay = value.birthdayDay
  if (!id || !name || !role || !team || !parseISODate(startDate)) return null
  if (typeof birthdayMonth !== "number" || typeof birthdayDay !== "number") return null
  if (birthdayMonth < 1 || birthdayMonth > 12) return null
  if (birthdayDay < 1 || birthdayDay > daysInBirthdayMonth(birthdayMonth)) return null
  const photo = isImageDataUrl(value.photoDataUrl) ? value.photoDataUrl : null
  return { id, name, role, team, photoDataUrl: photo, birthdayMonth, birthdayDay, startDate }
}

function cleanBoard(value: unknown): Board | null {
  if (!isRecord(value)) return null
  const id = cleanText(value.id, 80)
  const personId = cleanText(value.personId, 80)
  const kind = value.kind === "birthday" || value.kind === "anniversary" ? value.kind : null
  const year = value.year
  const message = typeof value.message === "string" ? value.message.trim() : ""
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : ""
  if (!id || !personId || !kind || typeof year !== "number" || !Number.isInteger(year)) return null
  if (year < 1990 || year > 2100) return null
  if (!message || message.length > 400) return null
  if (!/^\d{4}-\d{2}-\d{2}T/.test(createdAt)) return null
  const image = isImageDataUrl(value.imageDataUrl) ? value.imageDataUrl : null
  return {
    id,
    personId,
    kind,
    year,
    message,
    imageDataUrl: image,
    pinned: value.pinned === true,
    createdAt,
  }
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

export function sanitizeWorkspace(value: unknown): Workspace | null {
  if (!isRecord(value) || !isRecord(value.brand)) return null
  if (typeof value.brand.companyName !== "string") return null
  const companyName = value.brand.companyName.trim().slice(0, 60)
  const motto = typeof value.brand.motto === "string" ? value.brand.motto.trim().slice(0, 80) : ""
  const accent = typeof value.brand.accent === "string" && /^#[0-9a-fA-F]{6}$/.test(value.brand.accent)
    ? value.brand.accent.toLowerCase()
    : DEFAULT_ACCENT
  const logo = isImageDataUrl(value.brand.logoDataUrl) ? value.brand.logoDataUrl : null
  if (!Array.isArray(value.people) || !Array.isArray(value.boards)) return null

  const people = uniqueById(value.people.map(cleanPerson).filter((item): item is Person => item !== null))
  const known = new Set(people.map((item) => item.id))
  const boards = uniqueById(
    value.boards
      .map(cleanBoard)
      .filter((item): item is Board => item !== null && known.has(item.personId)),
  )

  return { brand: { companyName, motto, logoDataUrl: logo, accent }, people, boards }
}

export function loadWorkspace(store: KeyValueStore | null): { workspace: Workspace; warning: string | null } {
  if (!store) return { workspace: createSeedWorkspace(), warning: null }
  const raw = store.getItem(STORAGE_KEY)
  if (!raw) return { workspace: createSeedWorkspace(), warning: null }
  try {
    const workspace = sanitizeWorkspace(JSON.parse(raw) as unknown)
    if (!workspace) {
      return {
        workspace: createSeedWorkspace(),
        warning: "Saved boards could not be read. Sample boards are showing instead.",
      }
    }
    return { workspace, warning: null }
  } catch {
    return {
      workspace: createSeedWorkspace(),
      warning: "Saved boards could not be read. Sample boards are showing instead.",
    }
  }
}

export function saveWorkspace(workspace: Workspace, store: KeyValueStore): string | null {
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(workspace))
    return null
  } catch {
    return "The browser could not store that change. Try a smaller image."
  }
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
}

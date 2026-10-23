export type BoardKind = "birthday" | "anniversary"

export type Brand = {
  companyName: string
  motto: string
  logoDataUrl: string | null
  accent: string
}

export type Person = {
  id: string
  name: string
  role: string
  team: string
  photoDataUrl: string | null
  birthdayMonth: number
  birthdayDay: number
  startDate: string
}

export type Board = {
  id: string
  personId: string
  kind: BoardKind
  year: number
  message: string
  imageDataUrl: string | null
  pinned: boolean
  createdAt: string
}

export type Workspace = {
  brand: Brand
  people: Person[]
  boards: Board[]
}

export const ACCENT_PRESETS = [
  { name: "Pine", value: "#1f4d45" },
  { name: "Persimmon", value: "#c4553a" },
  { name: "Cobalt", value: "#244c8a" },
  { name: "Gold", value: "#8a6232" },
  { name: "Ink", value: "#1c1712" },
] as const

export const DEFAULT_ACCENT = "#1f4d45"

export const APP_NAME = "SpinSci"
export const COMPANY_NAME = "SpinSci"
export const COMPANY_LOGO = "/spinsci-logo.png"

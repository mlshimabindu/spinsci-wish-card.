import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { Person } from "./types.ts"
import { validateBoard, validatePerson, type PersonDraft } from "./validate.ts"

const today = new Date(2026, 9, 23)

function draft(overrides: Partial<PersonDraft> = {}): PersonDraft {
  return {
    id: "p-1",
    name: "Priya Raman",
    role: "Clinical Admin",
    team: "Care Delivery",
    photoDataUrl: null,
    birthdayMonth: "10",
    birthdayDay: "24",
    startDate: "2020-10-24",
    ...overrides,
  }
}

const person: Person = {
  id: "p-1",
  name: "Sable Quinn",
  role: "Reception",
  team: "Workplace",
  photoDataUrl: null,
  birthdayMonth: 4,
  birthdayDay: 2,
  startDate: "2026-09-01",
}

describe("validatePerson", () => {
  it("accepts a complete person", () => {
    assert.deepEqual(validatePerson(draft(), today), {})
  })

  it("rejects a future start date", () => {
    const errors = validatePerson(draft({ startDate: "2026-12-01" }), today)
    assert.match(errors.startDate ?? "", /future/)
  })

  it("rejects 31 April and accepts 29 February", () => {
    assert.ok(validatePerson(draft({ birthdayMonth: "4", birthdayDay: "31" }), today).birthdayDay)
    assert.equal(validatePerson(draft({ birthdayMonth: "2", birthdayDay: "29" }), today).birthdayDay, undefined)
  })

  it("rejects a blank name", () => {
    assert.ok(validatePerson(draft({ name: " " }), today).name)
  })
})

describe("validateBoard", () => {
  it("blocks an anniversary in the joining year", () => {
    const errors = validateBoard({
      person,
      kind: "anniversary",
      year: 2026,
      message: "Welcome.",
      imageSource: "profile",
      customImage: null,
    })
    assert.match(errors.year ?? "", /has not completed a year/)
  })

  it("allows the first anniversary year", () => {
    const errors = validateBoard({
      person,
      kind: "anniversary",
      year: 2027,
      message: "One year in.",
      imageSource: "profile",
      customImage: null,
    })
    assert.equal(errors.year, undefined)
  })

  it("requires a wish and a custom photo when that source is chosen", () => {
    const errors = validateBoard({
      person,
      kind: "birthday",
      year: 2026,
      message: "   ",
      imageSource: "custom",
      customImage: null,
    })
    assert.ok(errors.message)
    assert.ok(errors.image)
  })
})

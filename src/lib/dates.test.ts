import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  anniversaryOn,
  celebrateDay,
  daysUntil,
  isLeapShifted,
  nextAnniversary,
  nextBirthday,
} from "./dates.ts"

describe("celebrateDay", () => {
  it("keeps 29 February in a leap year", () => {
    const date = celebrateDay(2, 29, 2028)
    assert.equal(date.getFullYear(), 2028)
    assert.equal(date.getMonth(), 1)
    assert.equal(date.getDate(), 29)
    assert.equal(isLeapShifted(2, 29, 2028), false)
  })

  it("marks 29 February on 28 February in a non-leap year", () => {
    const date = celebrateDay(2, 29, 2026)
    assert.equal(date.getMonth(), 1)
    assert.equal(date.getDate(), 28)
    assert.equal(isLeapShifted(2, 29, 2026), true)
  })
})

describe("nextBirthday", () => {
  it("returns today when the birthday is today", () => {
    const date = nextBirthday(10, 23, new Date(2026, 9, 23, 15, 30))
    assert.equal(date.getFullYear(), 2026)
    assert.equal(date.getMonth(), 9)
    assert.equal(date.getDate(), 23)
    assert.equal(daysUntil(date, new Date(2026, 9, 23, 1)), 0)
  })

  it("rolls a passed birthday into next year", () => {
    const date = nextBirthday(1, 9, new Date(2026, 9, 23))
    assert.equal(date.getFullYear(), 2027)
    assert.equal(date.getMonth(), 0)
    assert.equal(date.getDate(), 9)
  })

  it("uses 28 February 2026 and then 29 February 2028", () => {
    const thisYear = nextBirthday(2, 29, new Date(2026, 1, 1))
    assert.equal(thisYear.getFullYear(), 2026)
    assert.equal(thisYear.getDate(), 28)
    const after = nextBirthday(2, 29, new Date(2026, 2, 1))
    assert.equal(after.getFullYear(), 2027)
    assert.equal(after.getMonth(), 1)
    assert.equal(after.getDate(), 28)
    const leap = nextBirthday(2, 29, new Date(2028, 0, 1))
    assert.equal(leap.getFullYear(), 2028)
    assert.equal(leap.getDate(), 29)
  })
})

describe("anniversaries", () => {
  it("counts completed years on the anniversary date", () => {
    const occasion = anniversaryOn("2022-10-23", 2026)
    assert.ok(occasion)
    assert.equal(occasion.years, 4)
    assert.equal(occasion.date.getDate(), 23)
  })

  it("does not treat the joining year as an anniversary", () => {
    assert.equal(anniversaryOn("2026-09-01", 2026), null)
  })

  it("schedules the first anniversary a year after a recent start", () => {
    const next = nextAnniversary("2026-09-01", new Date(2026, 9, 23))
    assert.ok(next)
    assert.equal(next.years, 1)
    assert.equal(next.date.getFullYear(), 2027)
    assert.equal(next.date.getMonth(), 8)
    assert.equal(next.date.getDate(), 1)
  })

  it("returns today for an anniversary happening today", () => {
    const next = nextAnniversary("2022-10-23", new Date(2026, 9, 23, 18))
    assert.ok(next)
    assert.equal(next.years, 4)
    assert.equal(daysUntil(next.date, new Date(2026, 9, 23)), 0)
  })

  it("shifts a 29 February start date in non-leap years", () => {
    const occasion = anniversaryOn("2024-02-29", 2026)
    assert.ok(occasion)
    assert.equal(occasion.years, 2)
    assert.equal(occasion.date.getDate(), 28)
    assert.equal(occasion.date.getMonth(), 1)
  })
})

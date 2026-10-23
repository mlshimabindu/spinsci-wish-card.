import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { upcomingOccasions } from "./occasions.ts"
import { createSeedWorkspace } from "./workspace.ts"

describe("upcomingOccasions", () => {
  const today = new Date(2026, 9, 23)

  it("includes today and the next 45 days, and leaves later dates out", () => {
    const { people } = createSeedWorkspace()
    const occasions = upcomingOccasions(people, today, 45)
    const labels = occasions.map((item) => `${item.person.id}:${item.kind}:${item.daysUntil}`)
    assert.deepEqual(labels, [
      "p-jonah:birthday:0",
      "p-rafael:anniversary:0",
      "p-priya:birthday:1",
      "p-priya:anniversary:1",
      "p-hana:birthday:5",
      "p-amira:anniversary:10",
    ])
  })

  it("does not list a work anniversary before the first year", () => {
    const { people } = createSeedWorkspace()
    const sable = people.find((person) => person.id === "p-sable")
    assert.ok(sable)
    const occasions = upcomingOccasions([sable], today, 400)
    assert.equal(occasions.some((item) => item.kind === "anniversary" && item.years === 0), false)
    const anniversary = occasions.find((item) => item.kind === "anniversary")
    assert.equal(anniversary?.years, 1)
    assert.equal(anniversary?.date.getFullYear(), 2027)
  })
})

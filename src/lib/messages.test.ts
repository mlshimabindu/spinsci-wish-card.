import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { defaultMessage, fillTemplate } from "./messages.ts"

const person = { name: "Priya Raman", role: "Clinical Admin", team: "Care Delivery" }
const brand = { companyName: "Northline" }

describe("wishes", () => {
  it("fills birthday tokens with the first name and team", () => {
    const message = defaultMessage("birthday", person, brand, null)
    assert.equal(
      message,
      "Happy birthday, Priya. Thank you for the care you bring to Care Delivery.",
    )
  })

  it("uses singular grammar for a one-year anniversary", () => {
    const message = defaultMessage("anniversary", person, brand, 1)
    assert.equal(message, "1 year at Northline. Thank you, Priya, for the work you put in.")
  })

  it("uses plural grammar for later anniversaries", () => {
    const message = fillTemplate("{years} with {team}.", {
      years: "6 years",
      team: "Care Delivery",
    })
    assert.equal(message, "6 years with Care Delivery.")
  })

  it("falls back when the company name is blank", () => {
    const message = defaultMessage("birthday", person, { companyName: "  " }, null)
    assert.match(message, /Care Delivery/)
  })
})

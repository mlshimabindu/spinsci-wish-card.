import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { composeTeamWish } from "./compose-wish.ts"

describe("composeTeamWish", () => {
  it("turns a short birthday note into a team wish", () => {
    const wish = composeTeamWish({
      kind: "birthday",
      name: "Priya Raman",
      note: "thanks for the calm you bring",
    })
    assert.equal(wish.headline, "Happy birthday, Priya")
    assert.equal(wish.body, "Thanks for the calm you bring. Wishing you a wonderful day.")
    assert.equal(wish.signoff, "From the SpinSci team")
  })

  it("turns a short anniversary note into a team wish", () => {
    const wish = composeTeamWish({
      kind: "anniversary",
      name: "Rafael Costa",
      note: "5 years of showing up for the night shift",
    })
    assert.equal(wish.headline, "Happy work anniversary, Rafael")
    assert.equal(
      wish.body,
      "5 years of showing up for the night shift. Thank you for another year at SpinSci.",
    )
  })

  it("turns a short appreciation note into a team wish", () => {
    const wish = composeTeamWish({
      kind: "appreciation",
      name: "Jonah Ellison",
      note: "stayed late to help the new joiners",
    })
    assert.equal(wish.headline, "Thank you, Jonah")
    assert.equal(wish.body, "Stayed late to help the new joiners. We are grateful to have you on the team.")
  })

  it("keeps a longer note as the card message", () => {
    const note = "You make the hard days easier, and the team is better because you are in it every single week."
    const wish = composeTeamWish({ kind: "birthday", name: "Hana Okonkwo", note })
    assert.equal(wish.headline, "Happy birthday, Hana")
    assert.equal(wish.body, note)
  })

  it("still writes a team wish when the note is empty", () => {
    const wish = composeTeamWish({ kind: "anniversary", name: "", note: "  " })
    assert.equal(wish.headline, "Happy work anniversary")
    assert.match(wish.body, /SpinSci/)
    assert.equal(wish.signoff, "From the SpinSci team")
  })
})
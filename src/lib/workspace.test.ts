import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { anniversaryOn, nextAnniversary, nextBirthday } from "./dates.ts"
import { STORAGE_KEY, createSeedWorkspace, loadWorkspace, sanitizeWorkspace, saveWorkspace, type KeyValueStore } from "./workspace.ts"

function memoryStore(): KeyValueStore & { dump: () => string | null } {
  let raw: string | null = null
  return {
    getItem: () => raw,
    setItem: (_key, value) => {
      raw = value
    },
    dump: () => raw,
  }
}

describe("workspace storage", () => {
  it("seeds today's birthday and anniversary", () => {
    const today = new Date(2026, 9, 23)
    const workspace = createSeedWorkspace()
    const jonah = workspace.people.find((person) => person.id === "p-jonah")
    const rafael = workspace.people.find((person) => person.id === "p-rafael")
    assert.ok(jonah && rafael)
    const birthday = nextBirthday(jonah.birthdayMonth, jonah.birthdayDay, today)
    assert.equal(birthday.getDate(), 23)
    const anniversary = nextAnniversary(rafael.startDate, today)
    assert.equal(anniversary?.years, 4)
    assert.equal(anniversaryOn(rafael.startDate, 2026)?.years, 4)
    assert.equal(workspace.brand.logoDataUrl?.startsWith("data:image/svg+xml"), true)
    assert.equal(workspace.boards.filter((board) => board.pinned).length, 2)
  })

  it("round-trips a workspace and drops an unsafe logo without deleting people", () => {
    const store = memoryStore()
    const workspace = createSeedWorkspace()
    assert.equal(saveWorkspace(workspace, store), null)
    const loaded = loadWorkspace(store)
    assert.equal(loaded.warning, null)
    assert.equal(loaded.workspace.people.length, workspace.people.length)
    assert.equal(loaded.workspace.boards.length, workspace.boards.length)

    const tampered = JSON.parse(store.dump() ?? "{}") as { brand: { logoDataUrl: string } }
    tampered.brand.logoDataUrl = "javascript:alert(1)"
    const sanitized = sanitizeWorkspace(tampered)
    assert.ok(sanitized)
    assert.equal(sanitized.brand.logoDataUrl, null)
    assert.equal(sanitized.brand.companyName, "Northline")
    assert.equal(sanitized.people.length, workspace.people.length)
  })

  it("replaces corrupt storage with the sample and a warning", () => {
    const store = memoryStore()
    store.setItem(STORAGE_KEY, "{")
    const loaded = loadWorkspace(store)
    assert.match(loaded.warning ?? "", /could not be read/)
    assert.ok(loaded.workspace.people.length > 0)
  })

  it("reports a storage failure", () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota")
      },
    }
    assert.match(saveWorkspace(createSeedWorkspace(), store) ?? "", /smaller image/)
  })
})

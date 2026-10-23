function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&apos;"
    }
  })
}

export function initialsAvatar(letters: string, background: string): string {
  const safeLetters = escapeXml(letters.slice(0, 3) || "?")
  const safeBackground = /^#[0-9a-fA-F]{6}$/.test(background) ? background : "#1f4d45"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${safeBackground}"/><text x="100" y="118" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#f6f1e7">${safeLetters}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function starLogo(fill = "#1f4d45"): string {
  const safeFill = /^#[0-9a-fA-F]{6}$/.test(fill) ? fill : "#1f4d45"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${safeFill}"/><path d="M32 10l3.2 14.2L50 28l-14.8 3.8L32 54l-3.2-22.2L14 28l14.8-3.8L32 10z" fill="#f6f0e6"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function isImageDataUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length >= 1_800_000) return false
  if (!/^data:image\/(png|jpe?g|webp|gif|svg\+xml)(?:;|,)/i.test(value)) return false
  if (!value.startsWith("data:image/svg+xml")) return true
  const payload = value.slice(value.indexOf(",") + 1)
  try {
    const decoded = decodeURIComponent(payload)
    return !/<script|javascript:/i.test(decoded)
  } catch {
    return false
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ])
  if (!allowed.has(file.type)) {
    throw new Error("Use a PNG, JPG, WEBP, GIF, or SVG file.")
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("That file is over 8 MB. Choose a smaller image.")
  }
  if (file.type === "image/svg+xml") {
    const text = await file.text()
    if (text.length > 200_000) throw new Error("That SVG is too large to store.")
    if (/<script|javascript:/i.test(text)) throw new Error("That SVG cannot be used.")
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
  }

  const bitmap = await createImageBitmap(file)
  try {
    const maxEdge = 960
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) throw new Error("This browser could not read that image.")
    context.drawImage(bitmap, 0, 0, width, height)
    const encoded = canvas.toDataURL("image/jpeg", 0.82)
    if (encoded.length > 1_200_000) return canvas.toDataURL("image/jpeg", 0.62)
    return encoded
  } finally {
    bitmap.close()
  }
}

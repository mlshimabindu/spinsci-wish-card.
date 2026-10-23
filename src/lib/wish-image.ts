export type WishKind = "birthday" | "anniversary" | "appreciation"

export const WISH_KINDS: { id: WishKind; label: string; title: string }[] = [
  { id: "birthday", label: "Birthday", title: "Happy birthday" },
  { id: "anniversary", label: "Anniversary", title: "Happy anniversary" },
  { id: "appreciation", label: "Appreciation", title: "With appreciation" },
]

const WIDTH = 1080
const MARGIN = 56
const CARD_RADIUS = 40
const INK = "#24143f"
const BODY = "#4a4160"
const KICKER = "#6a4cae"

const KIND_LABEL: Record<WishKind, string> = {
  birthday: "BIRTHDAY",
  anniversary: "WORK ANNIVERSARY",
  appreciation: "APPRECIATION",
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, limit: number): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n")
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (context.measureText(next).width <= maxWidth) {
        line = next
        continue
      }
      if (line) lines.push(line)
      if (context.measureText(word).width <= maxWidth) {
        line = word
        continue
      }
      let chunk = ""
      for (const char of word) {
        const trial = chunk + char
        if (context.measureText(trial).width > maxWidth && chunk) {
          lines.push(chunk)
          chunk = char
        } else {
          chunk = trial
        }
      }
      line = chunk
    }
    if (line) lines.push(line)
  }
  return lines.slice(0, limit)
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number,
) {
  const scale = Math.max(size / image.width, size / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image, x + (size - width) / 2, y + (size - height) / 2, width, height)
}

function fillCentered(context: CanvasRenderingContext2D, text: string, y: number, maxWidth: number) {
  let shown = text
  while (shown.length > 1 && context.measureText(shown).width > maxWidth) {
    shown = shown.slice(0, -2).trimEnd() + "…"
  }
  context.fillText(shown, WIDTH / 2, y)
}

function withoutWhiteBackground(image: HTMLImageElement): HTMLCanvasElement {
  const copy = document.createElement("canvas")
  copy.width = image.width
  copy.height = image.height
  const copyContext = copy.getContext("2d")
  if (!copyContext) return copy
  copyContext.drawImage(image, 0, 0)
  const pixels = copyContext.getImageData(0, 0, copy.width, copy.height)
  const data = pixels.data
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index] ?? 0
    const green = data[index + 1] ?? 0
    const blue = data[index + 2] ?? 0
    if (red >= 242 && green >= 242 && blue >= 242) data[index + 3] = 0
  }
  copyContext.putImageData(pixels, 0, 0)
  return copy
}

function drawContain(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number,
) {
  const scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight)
  const width = sourceWidth * scale
  const height = sourceHeight * scale
  context.drawImage(image, x + (boxWidth - width) / 2, y + (boxHeight - height) / 2, width, height)
}

function brandGradient(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const gradient = context.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, "#2f7bff")
  gradient.addColorStop(0.48, "#1ecad3")
  gradient.addColorStop(1, "#7a45d6")
  return gradient
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  const first = parts[0] ?? ""
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1] ?? ""
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

export async function drawWishImage(input: {
  logoUrl: string | null
  photoUrl: string | null
  name: string
  kind: WishKind
  headline: string
  body: string
  signoff: string
}): Promise<HTMLCanvasElement> {
  const measure = document.createElement("canvas").getContext("2d")
  if (!measure) throw new Error("This browser could not draw the wish.")

  const cardWidth = WIDTH - MARGIN * 2
  const textWidth = cardWidth - 140
  const headline = input.headline.trim() || "From the SpinSci team"
  const body = input.body.trim()
  const signoff = input.signoff.trim() || "From the SpinSci team"

  measure.font = "600 58px \"Segoe UI\", sans-serif"
  const headlineLines = wrapLines(measure, headline, textWidth, 3)
  measure.font = "30px \"Segoe UI\", sans-serif"
  const bodyLines = wrapLines(measure, body, textWidth, 12)

  const logoBoxHeight = 108
  const portrait = 248
  const headlineBlock = headlineLines.length * 72
  const bodyBlock = bodyLines.length * 46
  const cardHeight =
    28 +
    48 +
    logoBoxHeight +
    36 +
    28 +
    40 +
    portrait +
    52 +
    headlineBlock +
    28 +
    bodyBlock +
    40 +
    72 +
    56
  const height = MARGIN + cardHeight + MARGIN

  const canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser could not draw the wish.")
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"

  const page = context.createLinearGradient(0, 0, WIDTH, height)
  page.addColorStop(0, "#e7f3fb")
  page.addColorStop(0.55, "#f7f4fc")
  page.addColorStop(1, "#efe6f8")
  context.fillStyle = page
  context.fillRect(0, 0, WIDTH, height)

  const paintOrb = (x: number, y: number, radius: number, color: string) => {
    const glow = context.createRadialGradient(x, y, 0, x, y, radius)
    glow.addColorStop(0, color)
    glow.addColorStop(1, "rgba(255,255,255,0)")
    context.fillStyle = glow
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  paintOrb(WIDTH - 40, 20, 320, "rgba(47, 123, 255, 0.28)")
  paintOrb(30, height - 20, 300, "rgba(30, 202, 211, 0.22)")
  paintOrb(WIDTH * 0.72, height * 0.55, 260, "rgba(122, 69, 214, 0.14)")

  const cardX = MARGIN
  const cardY = MARGIN
  context.save()
  context.shadowColor = "rgba(36, 20, 63, 0.18)"
  context.shadowBlur = 48
  context.shadowOffsetY = 22
  context.fillStyle = "#ffffff"
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, CARD_RADIUS)
  context.fill()
  context.restore()

  context.save()
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, CARD_RADIUS)
  context.clip()
  context.fillStyle = brandGradient(context, cardX, cardY, cardWidth, 16)
  context.fillRect(cardX, cardY, cardWidth, 14)
  context.restore()

  const [logo, photo] = await Promise.all([
    input.logoUrl ? loadImage(input.logoUrl) : Promise.resolve(null),
    input.photoUrl ? loadImage(input.photoUrl) : Promise.resolve(null),
  ])

  let y = cardY + 28 + 44
  const logoBoxWidth = 560
  if (logo) {
    const cleaned = withoutWhiteBackground(logo)
    drawContain(context, cleaned, logo.width, logo.height, (WIDTH - logoBoxWidth) / 2, y, logoBoxWidth, logoBoxHeight)
  } else {
    context.fillStyle = INK
    context.font = "600 54px \"Segoe UI\", sans-serif"
    context.textAlign = "center"
    context.textBaseline = "alphabetic"
    fillCentered(context, "SpinSci", y + 72, textWidth)
  }

  y += logoBoxHeight + 44
  context.fillStyle = KICKER
  context.font = "600 18px \"Segoe UI\", sans-serif"
  context.textAlign = "center"
  context.textBaseline = "alphabetic"
  fillCentered(context, KIND_LABEL[input.kind], y, textWidth)

  y += 40
  const centerX = WIDTH / 2
  const centerY = y + portrait / 2
  const ring = brandGradient(context, centerX - portrait / 2, centerY - portrait / 2, portrait, portrait)
  context.beginPath()
  context.arc(centerX, centerY, portrait / 2, 0, Math.PI * 2)
  context.strokeStyle = ring
  context.lineWidth = 10
  context.stroke()

  context.beginPath()
  context.arc(centerX, centerY, portrait / 2 - 16, 0, Math.PI * 2)
  context.fillStyle = "#ffffff"
  context.fill()

  const photoRadius = portrait / 2 - 22
  context.save()
  context.beginPath()
  context.arc(centerX, centerY, photoRadius, 0, Math.PI * 2)
  context.clip()
  if (photo) {
    drawCover(context, photo, centerX - photoRadius, centerY - photoRadius, photoRadius * 2)
  } else {
    context.fillStyle = ring
    context.fillRect(centerX - photoRadius, centerY - photoRadius, photoRadius * 2, photoRadius * 2)
    const letters = initialsFor(input.name)
    if (letters) {
      context.fillStyle = "#ffffff"
      context.font = "600 72px \"Segoe UI\", sans-serif"
      context.textAlign = "center"
      context.textBaseline = "middle"
      context.fillText(letters, centerX, centerY + 2)
    }
  }
  context.restore()

  y += portrait + 64
  context.fillStyle = INK
  context.font = "600 58px \"Segoe UI\", sans-serif"
  context.textAlign = "center"
  context.textBaseline = "alphabetic"
  for (const line of headlineLines) {
    fillCentered(context, line, y, textWidth)
    y += 72
  }

  y += 8
  context.fillStyle = BODY
  context.font = "30px \"Segoe UI\", sans-serif"
  for (const line of bodyLines) {
    fillCentered(context, line, y, textWidth)
    y += 46
  }

  y += 28
  const ruleWidth = 96
  context.fillStyle = brandGradient(context, centerX - ruleWidth / 2, y, ruleWidth, 4)
  roundedRect(context, centerX - ruleWidth / 2, y, ruleWidth, 4, 2)
  context.fill()

  y += 48
  context.font = "600 26px \"Segoe UI\", sans-serif"
  const signoffWidth = Math.min(textWidth, context.measureText(signoff).width + 72)
  const pillX = centerX - signoffWidth / 2
  const pillY = y - 36
  context.fillStyle = "#f3eefb"
  roundedRect(context, pillX, pillY, signoffWidth, 56, 28)
  context.fill()
  context.fillStyle = INK
  fillCentered(context, signoff, y, textWidth)

  return canvas
}

export async function copyWishImage(canvas: HTMLCanvasElement): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    throw new Error("Right-click the image and choose Copy image.")
  }
  const blob = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error("The image could not be copied."))
    }, "image/png")
  })
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
}

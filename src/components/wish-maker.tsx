"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { composeTeamWish } from "@/lib/compose-wish"
import { fileToDataUrl, isImageDataUrl } from "@/lib/images"
import { COMPANY_LOGO, COMPANY_NAME } from "@/lib/types"
import { WISH_KINDS, canvasToPng, copyWishImage, drawWishImage, saveWishImage, wishFileName, type WishKind } from "@/lib/wish-image"

const LOGO_KEY = "merriday-logo"

export function WishMaker() {
  const formId = useId()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const [logo, setLogo] = useState(COMPANY_LOGO)
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [kind, setKind] = useState<WishKind>("birthday")
  const [message, setMessage] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const wish = useMemo(() => composeTeamWish({ kind, name, note: message }), [kind, name, message])

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = window.localStorage.getItem(LOGO_KEY)
      if (isImageDataUrl(saved)) setLogo(saved)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    let cancel = false
    const id = window.setTimeout(() => {
      void drawWishImage({
        logoUrl: logo,
        photoUrl: photo,
        name,
        kind,
        headline: wish.headline,
        body: wish.body,
        signoff: wish.signoff,
      }).then(async (canvas) => {
        if (cancel) return
        canvasRef.current = canvas
        blobRef.current = await canvasToPng(canvas)
        if (cancel) return
        setPreview(canvas.toDataURL("image/png"))
      }).catch(() => {
        if (!cancel) setNotice("The wish image could not be drawn.")
      })
    }, 120)
    return () => {
      cancel = true
      window.clearTimeout(id)
    }
  }, [logo, photo, name, kind, wish])

  async function onFile(file: File | undefined, target: "logo" | "photo") {
    const setError = target === "logo" ? setLogoError : setPhotoError
    if (!file) return
    try {
      const url = await fileToDataUrl(file)
      setError(null)
      setNotice(null)
      if (target === "logo") {
        setLogo(url)
        window.localStorage.setItem(LOGO_KEY, url)
      } else {
        setPhoto(url)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That image could not be used.")
    }
  }

  function readyBlob(): Blob | null {
    return blobRef.current
  }

  function saveImage() {
    const blob = readyBlob()
    if (!message.trim() || !blob) {
      setNotice("The image is still being made.")
      return
    }
    saveWishImage(blob, wishFileName(kind, name))
    setNotice("Saved. Open the PNG, then copy the picture from there if paste is blocked.")
  }

  function copyImage() {
    if (!message.trim()) {
      setNotice("Write a short note before copying the image.")
      return
    }
    const blob = readyBlob()
    if (!blob) {
      setNotice("The image is still being made.")
      return
    }
    setCopying(true)
    setNotice(null)
    void copyWishImage(blob).then(() => {
      setNotice("Copied. Paste it with Ctrl+V.")
    }).catch(() => {
      saveWishImage(blob, wishFileName(kind, name))
      setNotice("Copy was blocked, so the image was saved. Open the PNG and copy the picture.")
    }).finally(() => {
      setCopying(false)
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-col gap-3">
        <img src={logo} alt={COMPANY_NAME} className="h-12 w-auto max-w-full object-contain object-left" />
        <p className="text-sm text-muted-foreground">Make one wish image, then copy and paste it.</p>
      </header>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form className="grid gap-6" onSubmit={(event) => event.preventDefault()}>
          <section className="grid gap-3">
            <h2 className="font-heading text-2xl">1. Company logo</h2>
            <p className="text-sm text-muted-foreground">{COMPANY_NAME} is already set and appears on every wish. Replace the file only if the logo changes.</p>
            <div className="flex items-center gap-3">
              <img src={logo} alt={`${COMPANY_NAME} logo`} className="h-14 w-auto max-w-[240px] object-contain" />
              <input
                id={`${formId}-logo`}
                className="block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                aria-label="Company logo"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  void onFile(file, "logo")
                }}
              />
            </div>
            {logoError ? <p className="text-sm text-destructive" role="alert">{logoError}</p> : null}
          </section>

          <section className="grid gap-3">
            <h2 className="font-heading text-2xl">2. Employee photo</h2>
            <div className="flex items-center gap-3">
              {photo ? (
                <img src={photo} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-center text-xs text-muted-foreground">Photo</span>
              )}
              <input
                id={`${formId}-photo`}
                className="block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Employee photo"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  void onFile(file, "photo")
                }}
              />
            </div>
            {photoError ? <p className="text-sm text-destructive" role="alert">{photoError}</p> : null}
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${formId}-name`}>
              Employee name
              <Input
                id={`${formId}-name`}
                className="h-10 bg-card px-3"
                value={name}
                maxLength={60}
                placeholder="Name on the image"
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          </section>

          <section className="grid gap-3">
            <h2 className="font-heading text-2xl">3. Occasion</h2>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Occasion">
              {WISH_KINDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={kind === item.id}
                  className={`h-11 rounded-xl text-sm ring-1 ${kind === item.id ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border"}`}
                  onClick={() => setKind(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            <h2 className="font-heading text-2xl">4. Wish</h2>
            <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${formId}-message`}>
              Custom message
              <Textarea
                id={`${formId}-message`}
                className="min-h-28 bg-card"
                value={message}
                maxLength={400}
                placeholder="A few words are enough. The card writes the wish."
                onChange={(event) => {
                  setMessage(event.target.value)
                  setNotice(null)
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">{message.trim().length} / 400. Capitals and punctuation are corrected. A short note gets the closing for that event.</p>
            {message.trim() ? (
              <div className="grid gap-2 rounded-2xl bg-card p-4 ring-1 ring-border">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Message on the card</p>
                <p className="text-lg font-semibold text-foreground">{wish.headline}</p>
                <p className="text-sm leading-6 whitespace-pre-wrap">{wish.body}</p>
                <p className="text-sm font-medium">{wish.signoff}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add a short note and the team wish appears here.</p>
            )}
          </section>
        </form>

        <section className="grid justify-items-center gap-4 lg:sticky lg:top-6">
          {preview ? (
            <img src={preview} alt={`${wish.headline}. ${wish.signoff}`} className="w-full max-w-[420px] rounded-2xl shadow-lg ring-1 ring-black/10" />
          ) : (
            <div className="flex h-80 w-full max-w-[420px] items-center justify-center rounded-2xl bg-card text-sm text-muted-foreground ring-1 ring-border">
              The wish image will appear here.
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" className="h-11 px-5" onClick={copyImage} disabled={copying || !message.trim()}>
              {copying ? "Copying…" : "Copy image"}
            </Button>
            <Button type="button" variant="outline" className="h-11 bg-card px-5" onClick={saveImage} disabled={!message.trim() || !preview}>
              Save image
            </Button>
          </div>
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Paste with Ctrl+V. If the browser blocks copy, use Save image and copy the PNG from your downloads.
          </p>
          {notice ? <p className="text-sm" role="status">{notice}</p> : null}
        </section>
      </div>
    </div>
  )
}

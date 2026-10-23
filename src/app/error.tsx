"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="font-heading text-3xl">This page could not open</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The company logo saved in this browser is still there. Try the page again.
      </p>
      <Button type="button" className="mt-6 h-10 px-4" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}

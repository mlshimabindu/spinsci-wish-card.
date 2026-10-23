import type { Metadata } from "next"
import { APP_NAME } from "@/lib/types"
import "./globals.css"

export const metadata: Metadata = {
  title: APP_NAME,
  description: "SpinSci birthday, anniversary, and appreciation images you can copy.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}

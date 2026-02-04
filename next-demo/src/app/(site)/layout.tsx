import { draftMode } from "next/headers"
import { VisualEditing } from "next-sanity/visual-editing"
import { SanityLive } from "@/lib/sanity/live"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let isDraftMode = false
  try {
    const draft = await draftMode()
    isDraftMode = draft.isEnabled
  } catch {
    // draftMode() throws outside request scope
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)]">{children}</main>
      <Footer />
      <SanityLive />
      {isDraftMode && <VisualEditing />}
    </>
  )
}

import Link from "next/link"
import { Rss, Github } from "lucide-react"
import { getStates } from "@/lib/sanity/fetch"

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export async function Footer() {
  const states = (await getStates()).sort((a, b) => a.name.localeCompare(b.name))
  const currentYear = new Date().getFullYear()
  const companyName = "D.R. Horton"

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {states.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-6 text-xl font-bold">Starting your search? Find your new D.R. Horton home in these areas.</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {states.map((state) => (
                <Link key={state._id} href={`/states/${toSlug(state.name)}`} className="text-sm text-secondary hover:text-primary-400 transition-colors py-1 capitalize">
                  {state.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-secondary">
              &copy; {currentYear} {companyName} - All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/rss.xml" className="text-secondary hover:text-primary-600" aria-label="RSS Feed">
              <Rss className="h-5 w-5" />
            </Link>
            <a href="https://github.com" className="text-secondary hover:text-primary-600" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

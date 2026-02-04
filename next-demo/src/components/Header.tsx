"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { COMPANY_NAME } from "@/constants"
import { ThemeToggle } from "./ThemeToggle"

const navLinks = [{ href: "/blog", label: "Blog" }]

export function Header() {
  const currentPath = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl p-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            {COMPANY_NAME} (Next Demo)
          </Link>

          <div className="flex items-center gap-6">
            <ul className="flex items-center gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`transition-colors ${currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href)) ? "text-primary-600" : "dark:text-primary-600 light:text-white"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ThemeToggle />

            <Link href="/search" className="rounded-lg p-2 hover:bg-secondary" aria-label="Search">
              <Search className="size-5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

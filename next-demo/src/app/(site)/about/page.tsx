import type { Metadata } from "next";
import { AuthorCard } from "@/components/AuthorCard";
import { getAllAuthors } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about the blog and the team behind it.",
};

export default function AboutPage() {
  const authors = getAllAuthors();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">About</h1>
      <div className="mt-8 prose prose-lg max-w-none">
        <p className="text-secondary">
          Welcome to our blog, a modern demonstration of what&apos;s possible with
          Next.js and Sanity CMS. This showcases server-side rendering, app router,
          and real-time content management.
        </p>
        <h2 className="mt-8 text-2xl font-bold">Our Mission</h2>
        <p className="text-secondary">
          We believe the web should be fast, accessible, and beautiful. Next.js and
          Sanity deliver lightning-fast performance with real-time content updates.
        </p>
        <h2 className="mt-8 text-2xl font-bold">What We Cover</h2>
        <ul className="mt-4 space-y-2 text-secondary">
          <li>Web development frameworks and tools</li>
          <li>Performance optimization techniques</li>
          <li>Modern CSS and styling approaches</li>
          <li>TypeScript best practices</li>
          <li>Static site generation and content management</li>
        </ul>
        <h2 className="mt-8 text-2xl font-bold">Built With</h2>
        <ul className="mt-4 space-y-2 text-secondary">
          <li><strong>Next.js</strong> - The React framework for the web</li>
          <li><strong>Sanity</strong> - Structured content platform</li>
          <li><strong>Tailwind CSS</strong> - A utility-first CSS framework</li>
          <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
        </ul>
      </div>
      {authors.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Meet the Team</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {authors.map((author) => (
              <AuthorCard key={author.id} {...author} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

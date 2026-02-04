import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "..", "shared", "content", "posts");
const AUTHORS_DIR = path.join(process.cwd(), "..", "shared", "content", "authors");

export interface ContentPost {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  author: string;
  tags: string[];
  image?: string;
  body: string;
}

export interface ContentAuthor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  twitter?: string;
  github?: string;
}

export function getAllPosts(): ContentPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        id: file.replace(/\.mdx$/, ""),
        title: data.title,
        description: data.description,
        pubDate: new Date(data.pubDate),
        author: data.author,
        tags: data.tags || [],
        image: data.image,
        body: content,
      };
    })
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export function getPostById(id: string): ContentPost | undefined {
  return getAllPosts().find((p) => p.id === id);
}

export function getAllAuthors(): ContentAuthor[] {
  if (!fs.existsSync(AUTHORS_DIR)) return [];
  const files = fs.readdirSync(AUTHORS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(AUTHORS_DIR, file), "utf-8");
    return JSON.parse(raw) as ContentAuthor;
  });
}

export function getAuthorById(id: string): ContentAuthor | undefined {
  return getAllAuthors().find((a) => a.id === id);
}

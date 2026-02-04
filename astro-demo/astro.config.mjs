// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import pageInsight from "astro-page-insight";

import sanity from "@sanity/astro";
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://drhorton.com",
  adapter: node({ mode: "standalone" }),

  vite: {
    // @ts-ignore - Vite version mismatch between @tailwindcss/vite and Astro
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@sanity/vision"],
      include: [
        "sanity",
        "sanity/router",
        "sanity/structure",
        "@sanity/ui",
        "@sanity/icons",
        "styled-components",
        "react-compiler-runtime",
        "@sanity/visual-editing",
        "lodash-es",
      ],
      esbuildOptions: {
        // Handle CommonJS modules
        mainFields: ["module", "main"],
      },
    },
    ssr: {
      noExternal: [
        "sanity",
        "@sanity/ui",
        "@sanity/icons",
        "styled-components",
        "@sanity/visual-editing",
        "lodash-es",
      ],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react-is",
        "styled-components",
        "sanity",
        "@sanity/ui",
        "react-compiler-runtime",
      ],
      alias: {
        // Redirect lodash CommonJS to lodash-es for ESM compatibility
        "lodash/startCase": "lodash-es/startCase",
        "lodash/camelCase": "lodash-es/camelCase",
        "lodash/kebabCase": "lodash-es/kebabCase",
        "lodash/snakeCase": "lodash-es/snakeCase",
        "lodash/upperFirst": "lodash-es/upperFirst",
        "lodash/isEqual": "lodash-es/isEqual",
        "lodash/debounce": "lodash-es/debounce",
        "lodash/throttle": "lodash-es/throttle",
        "lodash/get": "lodash-es/get",
        "lodash/set": "lodash-es/set",
        lodash: "lodash-es",
      },
    },
  },
  integrations: [
    sanity({
      projectId: "9mua1ulx",
      dataset: "production",
      studioBasePath: "/admin",
      useCdn: false,
      apiVersion: "2024-01-01",
      stega: {
        studioUrl: "/admin",
      },
    }),

    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: {
        theme: "github-dark",
      },
    }),
    sitemap(),
    icon(),
    pageInsight(),
    react({
      babel: {
        plugins: [],
      },
    }),
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
    },
  },
});

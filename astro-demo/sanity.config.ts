import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "../studio/schemaTypes";
import { structure, defaultDocumentNode } from "../studio/deskStructure";

export default defineConfig({
  name: "default",
  title: "Horton",

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  basePath: "/admin",

  plugins: [
    structureTool({
      structure,
      defaultDocumentNode,
    }),
    presentationTool({
      previewUrl: location.origin,
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});

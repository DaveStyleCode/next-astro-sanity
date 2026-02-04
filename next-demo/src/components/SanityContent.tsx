import { PortableText } from "@portabletext/react";
import { CodeBlock } from "./portabletext/CodeBlock";
import { Image } from "./portabletext/Image";
import { MarkdownTable } from "./portabletext/MarkdownTable";

interface SanityContentProps {
  value: any[];
  removeFirstHeading?: boolean;
}

function processBlocks(blocks: any[], skipFirstHeading: boolean = false): any[] {
  if (!blocks || blocks.length === 0) return [];

  const result: any[] = [];
  let tableRows: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage = "";
  let inCodeBlock = false;
  let firstHeadingSkipped = !skipFirstHeading;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (!firstHeadingSkipped && block._type === "block") {
      const style = block.style;
      if (style === "h1" || style === "h2" || style === "h3") {
        firstHeadingSkipped = true;
        continue;
      }
    }

    if (block._type === "block" && block.style === "normal" && !block.listItem) {
      const children = block.children;
      if (!children || children.length === 0) {
        result.push(block);
        continue;
      }

      let text = "";
      for (let j = 0; j < children.length; j++) {
        if (children[j].text) text += children[j].text;
      }

      const firstChar = text[0];
      const lastChar = text[text.length - 1];

      if (firstChar === "`" && text.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = text.slice(3).trim();
          continue;
        } else {
          inCodeBlock = false;
          result.push({
            _type: "code",
            _key: `code-${result.length}`,
            code: codeLines.join("\n"),
            language: codeLanguage,
          });
          codeLines = [];
          codeLanguage = "";
          continue;
        }
      }

      if (inCodeBlock) {
        codeLines.push(text);
        continue;
      }

      if (firstChar === "|" && lastChar === "|") {
        tableRows.push(text);
        continue;
      }
    }

    if (tableRows.length > 0) {
      result.push({
        _type: "markdownTable",
        _key: `table-${result.length}`,
        rows: tableRows,
      });
      tableRows = [];
    }

    result.push(block);
  }

  if (tableRows.length > 0) {
    result.push({
      _type: "markdownTable",
      _key: `table-${result.length}`,
      rows: tableRows,
    });
  }

  if (codeLines.length > 0) {
    result.push({
      _type: "code",
      _key: `code-${result.length}`,
      code: codeLines.join("\n"),
      language: codeLanguage,
    });
  }

  return result;
}

const components = {
  types: {
    code: CodeBlock,
    image: Image,
    markdownTable: MarkdownTable,
  },
};

export function SanityContent({ value, removeFirstHeading = false }: SanityContentProps) {
  const processedValue = processBlocks(value, removeFirstHeading);

  return (
    <div className="prose prose-lg max-w-none">
      <PortableText value={processedValue} components={components} />
    </div>
  );
}

import { codeToHtml } from "shiki";

interface CodeBlockProps {
  value: {
    code?: string;
    language?: string;
  };
}

export async function CodeBlock({ value }: CodeBlockProps) {
  const code = value?.code || "";
  const language = value?.language || "text";

  let html: string;
  try {
    html = await codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    });
  } catch {
    html = await codeToHtml(code, {
      lang: "text",
      theme: "github-dark",
    });
  }

  return (
    <div className="overflow-x-auto my-6 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_code]:block [&_code]:leading-relaxed">
      <div
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

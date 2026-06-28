import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  let inList = false;
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    // Match bold **text**, italic *text*, or inline code `text`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={index} className="px-1.5 py-0.5 bg-slate-100 text-rose-600 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2.5 space-y-1.5 text-slate-700">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "---") {
      flushList(index);
      elements.push(<hr key={index} className="my-4 border-slate-200" />);
      return;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      flushList(index);
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const headingClasses =
          level === 1
            ? "text-2xl font-bold my-4 text-slate-800"
            : level === 2
            ? "text-xl font-bold my-3 text-slate-800"
            : "text-lg font-bold my-2 text-slate-800";

        elements.push(
          React.createElement(
            `h${level}`,
            { key: index, className: headingClasses },
            parseInline(text)
          )
        );
        return;
      }
    }

    // Bullet List items
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      inList = true;
      const text = trimmed.slice(2);
      listItems.push(
        <li key={`li-${index}`} className="text-sm leading-relaxed">
          {parseInline(text)}
        </li>
      );
      return;
    }

    // Numbered list items (e.g., "1. Item")
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      flushList(index);
      const num = numListMatch[1];
      const text = numListMatch[2];
      elements.push(
        <div key={index} className="font-bold text-slate-800 mt-4 mb-1 text-sm">
          {num}. {parseInline(text)}
        </div>
      );
      return;
    }

    // Blank line
    if (trimmed === "") {
      flushList(index);
      return;
    }

    // Regular paragraph line
    flushList(index);
    elements.push(
      <p key={index} className="text-sm leading-relaxed my-2 text-slate-700">
        {parseInline(line)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

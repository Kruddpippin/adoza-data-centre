// Tiny, dependency-free renderer for the lightweight markdown used in course lesson
// content (## headings, - bullets, 1. numbered lists, ```fenced code```, **bold**,
// `inline code`). Avoids pulling in a markdown library for what's a handful of
// hand-authored lessons with a very small, fixed set of formatting needs.

function renderInline(text) {
  const nodes = [];
  const regex = /\*\*(.+?)\*\*|`([^`]+?)`/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      nodes.push(
        <code key={key++} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {match[2]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", content: code.join("\n") });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", content: line.slice(3) });
      i++;
      continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !/^- /.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith("```")
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", content: para.join(" ") });
  }
  return blocks;
}

export function LessonContent({ text, className }) {
  const blocks = parseBlocks(text || "");
  return (
    <div className={className ?? "space-y-3 text-sm leading-relaxed"}>
      {blocks.map((b, idx) => {
        if (b.type === "heading") {
          return (
            <h3 key={idx} className="font-display pt-2 text-[15px] font-bold tracking-tight first:pt-0">
              {renderInline(b.content)}
            </h3>
          );
        }
        if (b.type === "code") {
          return (
            <pre key={idx} className="overflow-x-auto rounded-lg bg-[hsl(150_15%_10%)] p-3 text-xs text-white">
              <code className="font-mono">{b.content}</code>
            </pre>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={idx} className="list-disc space-y-1 pl-5">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={idx} className="list-decimal space-y-1 pl-5">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        return <p key={idx}>{renderInline(b.content)}</p>;
      })}
    </div>
  );
}

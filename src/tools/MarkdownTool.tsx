import { useMemo, useState } from 'react';
import { marked } from 'marked';
import { ToolLayout } from '../components/ToolLayout';
import { SplitPane } from '../components/SplitPane';

const SAMPLE = `# DevForge

A **desktop developer toolkit**.

## Features

- JS playground with live output
- JSON, JWT, Regex, Encoders
- Hash, Color, Diff, Markdown

> Press **⌘+Enter** in the playground to run code.

\`\`\`js
const square = (n) => n * n;
console.log(square(7));
\`\`\`

| Tool | Status |
| ---- | ------ |
| JSON | ✓ |
| JWT  | ✓ |
| Regex| ✓ |

[Visit the docs](https://devforge.app)
`;

export function MarkdownTool() {
  const [text, setText] = useState(SAMPLE);

  const html = useMemo(() => {
    return marked.parse(text, { gfm: true, breaks: true }) as string;
  }, [text]);

  return (
    <ToolLayout title="Markdown" description="Live GitHub-flavored markdown previewer.">
      <SplitPane
        left={
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea h-full rounded-none border-0"
            spellCheck={false}
          />
        }
        right={
          <div className="prose-md h-full overflow-y-auto bg-bg-panel p-6 text-text">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        }
      />
    </ToolLayout>
  );
}

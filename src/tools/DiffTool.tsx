import { useMemo, useState } from 'react';
import { diffLines, diffWordsWithSpace } from 'diff';
import { ToolLayout } from '../components/ToolLayout';

const A = `function greet(name) {
  return 'Hello, ' + name;
}

const result = greet('world');
console.log(result);
`;
const B = `function greet(name = 'friend') {
  const greeting = \`Hello, \${name}!\`;
  return greeting;
}

const result = greet('DevForge');
console.log(result);
`;

type Mode = 'line' | 'word';

export function DiffTool() {
  const [a, setA] = useState(A);
  const [b, setB] = useState(B);
  const [mode, setMode] = useState<Mode>('line');

  const diff = useMemo(() => {
    return mode === 'line' ? diffLines(a, b) : diffWordsWithSpace(a, b);
  }, [a, b, mode]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    diff.forEach((p) => {
      const c = (p.value.match(/\n/g) || ['']).length;
      if (p.added) added += c;
      if (p.removed) removed += c;
    });
    return { added, removed };
  }, [diff]);

  return (
    <ToolLayout
      title="Text Diff"
      description="Compare two pieces of text. Line or word granularity."
      toolbar={
        <>
          <div className="flex gap-1 rounded-md border border-border bg-bg-subtle p-0.5">
            {(['line', 'word'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded px-2 py-0.5 text-xs ${mode === m ? 'bg-accent text-white' : 'text-text-muted'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-success">+{stats.added}</span>
          <span className="text-xs font-mono text-danger">-{stats.removed}</span>
        </>
      }
    >
      <div className="grid h-full grid-rows-[1fr_1fr] overflow-hidden">
        <div className="grid grid-cols-2 overflow-hidden border-b border-border">
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="textarea h-full rounded-none border-0 border-r border-border"
            placeholder="Original"
          />
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="textarea h-full rounded-none border-0"
            placeholder="Changed"
          />
        </div>
        <div className="overflow-auto bg-bg-subtle p-4 font-mono text-[13px] leading-relaxed">
          {diff.map((p, i) => (
            <span
              key={i}
              className={
                p.added
                  ? 'bg-success/20 text-success'
                  : p.removed
                  ? 'bg-danger/20 text-danger line-through'
                  : 'text-text-muted'
              }
            >
              {p.value}
            </span>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

import { useMemo, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { SplitPane } from '../components/SplitPane';
import { CodeEditor } from '../components/CodeEditor';

const SAMPLE = `{
  "name": "DevForge",
  "version": "0.1.0",
  "tools": ["playground", "json", "jwt", "regex"],
  "stats": { "stars": 0, "active": true, "score": 4.7 }
}`;

export function JsonTool() {
  const [text, setText] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const parsed = useMemo(() => {
    try {
      return { ok: true as const, value: JSON.parse(text), error: null };
    } catch (e: any) {
      return { ok: false as const, value: null, error: e.message };
    }
  }, [text]);

  const format = () => {
    if (parsed.ok) setText(JSON.stringify(parsed.value, null, indent));
  };
  const minify = () => {
    if (parsed.ok) setText(JSON.stringify(parsed.value));
  };
  const copy = () => navigator.clipboard.writeText(text);

  return (
    <ToolLayout
      title="JSON"
      description="Validate, format, minify and explore JSON as a tree."
      toolbar={
        <>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="input !w-auto !py-1"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>tabs</option>
          </select>
          <button className="btn" onClick={minify}>Minify</button>
          <button className="btn" onClick={copy}>Copy</button>
          <button className="btn btn-primary" onClick={format} disabled={!parsed.ok}>
            Format
          </button>
        </>
      }
    >
      <SplitPane
        left={
          <div className="flex h-full flex-col">
            <div
              className={`shrink-0 border-b border-border px-4 py-2 text-xs font-mono ${
                parsed.ok ? 'text-success' : 'text-danger bg-danger/5'
              }`}
            >
              {parsed.ok ? '✓ Valid JSON' : `✗ ${parsed.error}`}
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor value={text} onChange={setText} language="json" />
            </div>
          </div>
        }
        right={
          <div className="h-full overflow-y-auto bg-bg-panel p-4 font-mono text-[13px]">
            {parsed.ok ? (
              <JsonNode value={parsed.value} k="root" />
            ) : (
              <div className="text-text-dim">Fix JSON to see tree.</div>
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}

function JsonNode({ k, value, depth = 0 }: { k: string; value: any; depth?: number }) {
  if (value === null) return <Leaf k={k} v="null" cls="text-text-dim" />;
  const t = typeof value;
  if (t === 'string') return <Leaf k={k} v={`"${value}"`} cls="text-emerald-400" />;
  if (t === 'number' || t === 'boolean') return <Leaf k={k} v={String(value)} cls="text-amber-300" />;
  if (Array.isArray(value)) {
    return (
      <details open={depth < 2} className="ml-0">
        <summary className="cursor-pointer select-none">
          <span className="text-text-muted">{k}</span>
          <span className="text-text-dim"> Array({value.length})</span>
        </summary>
        <div className="ml-4 border-l border-border pl-3">
          {value.map((v, i) => (
            <JsonNode key={i} k={String(i)} value={v} depth={depth + 1} />
          ))}
        </div>
      </details>
    );
  }
  if (t === 'object') {
    const keys = Object.keys(value);
    return (
      <details open={depth < 2}>
        <summary className="cursor-pointer select-none">
          <span className="text-text-muted">{k}</span>
          <span className="text-text-dim"> Object · {keys.length} keys</span>
        </summary>
        <div className="ml-4 border-l border-border pl-3">
          {keys.map((kk) => (
            <JsonNode key={kk} k={kk} value={value[kk]} depth={depth + 1} />
          ))}
        </div>
      </details>
    );
  }
  return null;
}

function Leaf({ k, v, cls }: { k: string; v: string; cls: string }) {
  return (
    <div className="py-0.5">
      <span className="text-text-muted">{k}</span>
      <span className="text-text-dim">: </span>
      <span className={cls}>{v}</span>
    </div>
  );
}

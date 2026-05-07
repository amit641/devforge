import { useMemo, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const SAMPLE_TEXT = `Visit https://devforge.app and email hi@devforge.app.
Also try http://localhost:3000 — released on 2026-05-07.
Phone: +1 (415) 555-0142.`;

interface MatchInfo {
  index: number;
  end: number;
  text: string;
  groups: string[];
  named: Record<string, string>;
}

export function RegexTool() {
  const [pattern, setPattern] = useState<string>('https?://[^\\s]+');
  const [flags, setFlags] = useState<string>('gi');
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [replace, setReplace] = useState<string>('');

  const result = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], error: null, regex: null as RegExp | null };
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const matches: MatchInfo[] = [];
      let m: RegExpExecArray | null;
      let safety = 0;
      while ((m = re.exec(text)) !== null) {
        if (m[0].length === 0) re.lastIndex++;
        matches.push({
          index: m.index,
          end: m.index + m[0].length,
          text: m[0],
          groups: m.slice(1),
          named: { ...(m.groups || {}) },
        });
        if (++safety > 5000) break;
      }
      return { matches, error: null, regex: new RegExp(pattern, flags) };
    } catch (e: any) {
      return { matches: [] as MatchInfo[], error: e.message, regex: null };
    }
  }, [pattern, flags, text]);

  const replaced = useMemo(() => {
    if (!result.regex) return '';
    try {
      return text.replace(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'), replace);
    } catch {
      return '';
    }
  }, [text, pattern, flags, replace, result.regex]);

  return (
    <ToolLayout title="Regex Tester" description="Test JavaScript regular expressions with live highlighting.">
      <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden">
        <div className="border-b border-border bg-bg-panel p-4">
          <div className="flex items-stretch gap-2">
            <span className="flex items-center px-2 font-mono text-text-dim">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="input flex-1 font-mono"
              placeholder="pattern"
              spellCheck={false}
            />
            <span className="flex items-center px-2 font-mono text-text-dim">/</span>
            <input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="input !w-20 font-mono"
              placeholder="gi"
            />
          </div>
          {result.error && (
            <div className="mt-2 text-xs text-danger">✗ {result.error}</div>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
            {['g', 'i', 'm', 's', 'u', 'y'].map((f) => (
              <label key={f} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={flags.includes(f)}
                  onChange={(e) =>
                    setFlags((cur) =>
                      e.target.checked ? cur + f : cur.replace(f, '')
                    )
                  }
                  className="accent-accent"
                />
                <code className="font-mono">{f}</code>
              </label>
            ))}
            <span className="ml-auto font-mono">
              {result.matches.length} match{result.matches.length === 1 ? '' : 'es'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 overflow-hidden">
          <div className="flex flex-col border-r border-border overflow-hidden">
            <div className="shrink-0 border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Input
            </div>
            <div className="grid grid-rows-2 overflow-hidden">
              <div className="overflow-hidden border-b border-border">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="textarea h-full rounded-none border-0"
                />
              </div>
              <div className="overflow-y-auto whitespace-pre-wrap break-words bg-bg-subtle p-4 font-mono text-sm leading-relaxed">
                <Highlighted text={text} matches={result.matches} />
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="shrink-0 border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Matches
            </div>
            <div className="flex-1 overflow-y-auto">
              {result.matches.length === 0 ? (
                <div className="p-4 text-sm text-text-dim">No matches.</div>
              ) : (
                result.matches.map((m, i) => (
                  <div key={i} className="border-b border-border-subtle px-4 py-2 text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-accent">{m.text}</span>
                      <span className="text-xs text-text-dim">[{m.index}:{m.end}]</span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="mt-1 space-y-0.5 text-xs text-text-muted">
                        {m.groups.map((g, gi) => (
                          <div key={gi} className="font-mono">
                            <span className="text-text-dim">${gi + 1}: </span>
                            {g ?? <span className="text-text-dim">undefined</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="shrink-0 border-t border-border bg-bg-panel p-3">
              <label className="label">Replace with</label>
              <input
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Use $1, $2 for groups"
                className="input font-mono"
              />
              {replace && (
                <pre className="mt-2 max-h-32 overflow-auto rounded-md border border-border bg-bg-subtle p-2 font-mono text-xs">
                  {replaced}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function Highlighted({ text, matches }: { text: string; matches: MatchInfo[] }) {
  if (matches.length === 0) return <>{text}</>;
  const out: any[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <mark key={i} className="rounded-sm bg-accent/30 px-0.5 text-text">
        {text.slice(m.index, m.end)}
      </mark>
    );
    last = m.end;
  });
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

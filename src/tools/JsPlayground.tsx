import { useCallback, useEffect, useRef, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';
import { SplitPane } from '../components/SplitPane';
import { CodeEditor } from '../components/CodeEditor';

const DEFAULT_CODE = `// Welcome to DevForge JS Playground
// Press ⌘+Enter (Ctrl+Enter) or click Run.
// Output of expressions and console.* calls appears on the right.

const greet = (name) => \`Hello, \${name}!\`;

console.log(greet('developer'));

// Async works too
const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(r => r.json());

console.table(data);

// The last expression is shown as the result
[1, 2, 3].map(n => n * n);
`;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'result';

interface LogEntry {
  id: number;
  level: LogLevel;
  parts: any[];
  time: number;
}

const RUNNER_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><script>
  function serialize(v, depth = 0) {
    if (depth > 4) return '…';
    if (v === null) return { __t: 'null' };
    if (v === undefined) return { __t: 'undefined' };
    const t = typeof v;
    if (t === 'function') return { __t: 'function', name: v.name || '(anonymous)', src: v.toString().slice(0, 200) };
    if (t === 'symbol') return { __t: 'symbol', value: v.toString() };
    if (t === 'bigint') return { __t: 'bigint', value: v.toString() };
    if (t !== 'object') return { __t: t, value: v };
    if (v instanceof Error) return { __t: 'error', name: v.name, message: v.message, stack: v.stack };
    if (v instanceof Date) return { __t: 'date', value: v.toISOString() };
    if (v instanceof RegExp) return { __t: 'regexp', value: v.toString() };
    if (Array.isArray(v)) return { __t: 'array', value: v.map(x => serialize(x, depth + 1)) };
    if (v instanceof Map) return { __t: 'map', value: [...v.entries()].map(([k, val]) => [serialize(k, depth+1), serialize(val, depth+1)]) };
    if (v instanceof Set) return { __t: 'set', value: [...v].map(x => serialize(x, depth+1)) };
    const out = {};
    for (const k of Object.keys(v).slice(0, 100)) {
      try { out[k] = serialize(v[k], depth + 1); } catch (e) { out[k] = { __t: 'error', message: String(e) }; }
    }
    return { __t: 'object', constructor: v.constructor && v.constructor.name, value: out };
  }

  function send(level, parts) {
    parent.postMessage({ __devforge: true, level, parts: parts.map(p => serialize(p)) }, '*');
  }

  ['log','info','warn','error','debug'].forEach(level => {
    const orig = console[level];
    console[level] = (...args) => { send(level, args); try { orig.apply(console, args); } catch(e){} };
  });

  window.addEventListener('error', e => send('error', [e.error || e.message]));
  window.addEventListener('unhandledrejection', e => send('error', ['Unhandled rejection:', e.reason]));

  window.addEventListener('message', async (e) => {
    if (!e.data || e.data.__devforge_run !== true) return;
    const code = e.data.code;
    try {
      const fn = new Function('return (async () => {\\n' + code + '\\n})()');
      const result = await fn();
      if (result !== undefined) send('result', [result]);
      parent.postMessage({ __devforge: true, done: true }, '*');
    } catch (err) {
      send('error', [err]);
      parent.postMessage({ __devforge: true, done: true }, '*');
    }
  });
  parent.postMessage({ __devforge: true, ready: true }, '*');
</script></head><body></body></html>`;

export function JsPlayground() {
  const [code, setCode] = useState<string>(() => localStorage.getItem('devforge.playground.code') ?? DEFAULT_CODE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const queueRef = useRef<string | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('devforge.playground.code', code);
  }, [code]);

  const addLog = useCallback((level: LogLevel, parts: any[]) => {
    setLogs((prev) => [...prev, { id: ++idRef.current, level, parts, time: Date.now() }]);
  }, []);

  const resetIframe = useCallback(() => {
    readyRef.current = false;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = RUNNER_HTML;
    }
  }, []);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const d = e.data;
      if (!d || !d.__devforge) return;
      if (d.ready) {
        readyRef.current = true;
        if (queueRef.current !== null) {
          iframeRef.current?.contentWindow?.postMessage(
            { __devforge_run: true, code: queueRef.current },
            '*'
          );
          queueRef.current = null;
        }
      } else if (d.done) {
        setRunning(false);
      } else if (d.level) {
        addLog(d.level, d.parts);
      }
    }
    window.addEventListener('message', onMsg);
    resetIframe();
    return () => window.removeEventListener('message', onMsg);
  }, [addLog, resetIframe]);

  const run = useCallback(() => {
    setLogs([]);
    setRunning(true);
    resetIframe();
    queueRef.current = code;
  }, [code, resetIframe]);

  // Auto-run with debounce
  useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(() => run(), 600);
    return () => clearTimeout(t);
  }, [autoRun, code, run]);

  const clear = () => setLogs([]);

  return (
    <ToolLayout
      title="JavaScript Playground"
      description="Write JS, get output. Supports async/await, fetch, console.*. Press ⌘+Enter to run."
      toolbar={
        <>
          <label className="flex items-center gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="accent-accent"
            />
            Auto-run
          </label>
          <button className="btn" onClick={clear}>
            Clear
          </button>
          <button className="btn btn-primary" onClick={run} disabled={running}>
            {running ? 'Running…' : 'Run ▶'}
          </button>
        </>
      }
    >
      <iframe
        ref={iframeRef}
        title="runner"
        sandbox="allow-scripts"
        style={{ display: 'none' }}
      />
      <SplitPane
        left={
          <div className="h-full bg-[#1e1e1e]">
            <CodeEditor value={code} onChange={setCode} onRun={run} />
          </div>
        }
        right={<ConsolePanel logs={logs} />}
      />
    </ToolLayout>
  );
}

function ConsolePanel({ logs }: { logs: LogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs]);

  return (
    <div className="h-full overflow-y-auto bg-bg-panel font-mono text-[13px]">
      {logs.length === 0 ? (
        <div className="p-6 text-center text-sm text-text-dim">
          Output will appear here. Use console.log() or return an expression.
        </div>
      ) : (
        logs.map((l) => <LogRow key={l.id} log={l} />)
      )}
      <div ref={endRef} />
    </div>
  );
}

function LogRow({ log }: { log: LogEntry }) {
  const colors: Record<LogLevel, string> = {
    log: 'text-text',
    info: 'text-sky-400',
    warn: 'text-warning',
    error: 'text-danger',
    debug: 'text-text-muted',
    result: 'text-accent',
  };
  const labels: Record<LogLevel, string> = {
    log: '›',
    info: 'i',
    warn: '!',
    error: '✗',
    debug: '·',
    result: '⇒',
  };
  return (
    <div
      className={`flex items-start gap-3 border-b border-border-subtle px-4 py-2 ${
        log.level === 'error' ? 'bg-danger/5' : ''
      }`}
    >
      <span className={`mt-0.5 select-none text-xs font-bold ${colors[log.level]}`}>
        {labels[log.level]}
      </span>
      <div className={`flex-1 break-words ${colors[log.level]}`}>
        {log.parts.map((p, i) => (
          <span key={i} className="mr-2">
            <ValuePreview v={p} />
          </span>
        ))}
      </div>
    </div>
  );
}

function ValuePreview({ v }: { v: any }) {
  if (!v || typeof v !== 'object' || !('__t' in v)) {
    return <span>{String(v)}</span>;
  }
  switch (v.__t) {
    case 'null':
      return <span className="text-text-dim">null</span>;
    case 'undefined':
      return <span className="text-text-dim">undefined</span>;
    case 'string':
      return <span className="text-emerald-400">"{v.value}"</span>;
    case 'number':
    case 'boolean':
    case 'bigint':
      return <span className="text-amber-300">{String(v.value)}</span>;
    case 'symbol':
      return <span className="text-pink-400">{v.value}</span>;
    case 'function':
      return <span className="text-sky-400">ƒ {v.name}()</span>;
    case 'date':
      return <span className="text-amber-300">Date({v.value})</span>;
    case 'regexp':
      return <span className="text-pink-400">{v.value}</span>;
    case 'error':
      return (
        <span className="text-danger">
          {v.name}: {v.message}
          {v.stack && (
            <pre className="mt-1 whitespace-pre-wrap text-[11px] text-danger/70">
              {v.stack}
            </pre>
          )}
        </span>
      );
    case 'array':
      return <ObjectPreview kind="array" entries={v.value.map((x: any, i: number) => [String(i), x])} />;
    case 'object':
      return <ObjectPreview kind="object" name={v.constructor} entries={Object.entries(v.value)} />;
    case 'set':
      return <ObjectPreview kind="set" entries={v.value.map((x: any, i: number) => [String(i), x])} />;
    case 'map':
      return <ObjectPreview kind="map" entries={v.value.map(([k, val]: any, i: number) => [`[${i}] ${prettyKey(k)}`, val])} />;
    default:
      return <span>{JSON.stringify(v)}</span>;
  }
}

function prettyKey(k: any): string {
  if (k && typeof k === 'object' && '__t' in k) {
    if (k.__t === 'string') return `"${k.value}"`;
    if ('value' in k) return String(k.value);
  }
  return String(k);
}

function ObjectPreview({
  kind,
  name,
  entries,
}: {
  kind: 'object' | 'array' | 'set' | 'map';
  name?: string;
  entries: [string, any][];
}) {
  const open = kind === 'array' ? '[' : '{';
  const close = kind === 'array' ? ']' : '}';
  const label = kind === 'array' ? `Array(${entries.length})` : kind === 'object' ? name && name !== 'Object' ? name : '' : `${kind[0].toUpperCase()}${kind.slice(1)}(${entries.length})`;
  return (
    <details className="inline-block align-top">
      <summary className="cursor-pointer select-none">
        {label && <span className="text-text-muted">{label} </span>}
        <span className="text-text-dim">{open}…{close}</span>
      </summary>
      <div className="ml-4 border-l border-border pl-3">
        {entries.map(([k, val]) => (
          <div key={k} className="py-0.5">
            <span className="text-text-muted">{k}</span>
            <span className="text-text-dim">: </span>
            <ValuePreview v={val} />
          </div>
        ))}
      </div>
    </details>
  );
}
